'use client';

import { useCallback, useEffect, useState } from 'react';
import { clients as seedClients } from '@/lib/data';

export interface Client {
  id: string;
  name: string;
  coachName: string;
  whatsappGroup: string;
  landingPage: string;
  zoomEmail: string;
}

export type ClientDraft = Omit<Client, 'id'>;

const STORAGE_KEY = 'webinar-clients';
const SEED_VERSION_KEY = 'webinar-clients-seed-version';

/** Bump when lib/data.ts clients change and browsers need to pick them up. */
const SEED_VERSION = 2;

/** Placeholder clients shipped before the real list; removed on upgrade. */
const RETIRED_SEED_NAMES = ['ABC Coaching', 'XYZ Academy', 'PQR Institute'];

/**
 * Seeding only on an empty store would leave every browser that has already
 * used the app stuck with the old sample clients. This drops those samples and
 * adds any seed client that is missing, while leaving anything the Team Lead
 * added alone.
 */
function applySeed(stored: Client[]): Client[] {
  const kept = stored.filter((client) => !RETIRED_SEED_NAMES.includes(client.name));
  const present = new Set(kept.map((client) => client.name.toLowerCase()));
  const missing = seedClients.filter((client) => !present.has(client.name.toLowerCase()));
  return ensureUniqueIds([...kept, ...missing]);
}

/**
 * A client the Team Lead added can hold an id that a seed client also uses, so
 * merging the two lists can produce duplicates. Ids are only React keys and the
 * basis for the next id, so renumbering the later collision is safe.
 */
function ensureUniqueIds(clients: Client[]): Client[] {
  const taken = new Set<string>();

  return clients.map((client) => {
    if (!taken.has(client.id)) {
      taken.add(client.id);
      return client;
    }

    let n = 1;
    let candidate = `C${String(n).padStart(3, '0')}`;
    while (taken.has(candidate)) {
      n += 1;
      candidate = `C${String(n).padStart(3, '0')}`;
    }
    taken.add(candidate);
    return { ...client, id: candidate };
  });
}

export const EMPTY_DRAFT: ClientDraft = {
  name: '',
  coachName: '',
  whatsappGroup: '',
  landingPage: '',
  zoomEmail: '',
};

function nextId(existing: Client[]): string {
  const highest = existing.reduce((max, client) => {
    const parsed = Number.parseInt(client.id.replace(/^C/, ''), 10);
    return Number.isFinite(parsed) && parsed > max ? parsed : max;
  }, 0);
  return `C${String(highest + 1).padStart(3, '0')}`;
}

/** Validates a draft, returning field -> message for anything wrong. */
export function validateDraft(draft: ClientDraft): Partial<Record<keyof ClientDraft, string>> {
  const errors: Partial<Record<keyof ClientDraft, string>> = {};

  if (!draft.name.trim()) errors.name = 'Client name is required.';
  if (!draft.coachName.trim()) errors.coachName = 'Coach name is required.';

  if (draft.zoomEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.zoomEmail.trim())) {
    errors.zoomEmail = 'Enter a valid email address.';
  }

  for (const field of ['whatsappGroup', 'landingPage'] as const) {
    const value = draft[field].trim();
    if (value && !/^https?:\/\/\S+$/i.test(value)) {
      errors[field] = 'Enter a full URL starting with http:// or https://';
    }
  }

  return errors;
}

/**
 * Clients live in this browser's localStorage, seeded from lib/data.ts the
 * first time. Swapping this hook's body for API calls is what makes the list
 * shared across the team - see the note in README.
 */
export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const storedVersion = Number(localStorage.getItem(SEED_VERSION_KEY) ?? 0);

      if (!saved) {
        setClients(seedClients);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedClients));
      } else if (storedVersion < SEED_VERSION) {
        const merged = applySeed(JSON.parse(saved) as Client[]);
        setClients(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } else {
        setClients(JSON.parse(saved) as Client[]);
      }

      localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
    } catch {
      setClients(seedClients);
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Client[]) => {
    setClients(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.error('Failed to save clients:', error);
    }
  }, []);

  const addClient = useCallback(
    (draft: ClientDraft) => {
      const created: Client = { id: nextId(clients), ...draft };
      persist([...clients, created]);
      return created;
    },
    [clients, persist]
  );

  const updateClient = useCallback(
    (id: string, draft: ClientDraft) => {
      persist(clients.map((client) => (client.id === id ? { ...client, ...draft } : client)));
    },
    [clients, persist]
  );

  const removeClient = useCallback(
    (id: string) => {
      persist(clients.filter((client) => client.id !== id));
    },
    [clients, persist]
  );

  return { clients, loaded, addClient, updateClient, removeClient };
}

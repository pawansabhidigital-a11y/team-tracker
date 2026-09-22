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
      setClients(saved ? (JSON.parse(saved) as Client[]) : seedClients);
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

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import ClientFields from '@/components/ClientFields';
import { useClients, validateDraft, type ClientDraft } from '@/lib/clients';
import { can } from '@/lib/rbac';

interface ChecklistEntry {
  webinarDate: string;
  clientName: string;
  stepNumber: number;
  stepName: string;
  completed: boolean;
  completedBy: string;
  completedAt: string;
  notes: string;
  issuesFound: string;
}

export default function ClientDetail({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const canEdit = can(role, 'client:edit');

  const { clients, loaded, updateClient } = useClients();
  const client = clients.find((entry) => entry.id === params.id);

  const [allChecklists, setAllChecklists] = useState<Record<string, ChecklistEntry[]>>({});
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ClientDraft | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientDraft, string>>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('webinar-checklists');
      if (saved) setAllChecklists(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load checklists:', error);
    }
  }, []);

  /** Every webinar run for this client, newest first. */
  const webinars = useMemo(() => {
    if (!client) return [];

    return Object.values(allChecklists)
      .filter((entries) => entries[0]?.clientName === client.name)
      .map((entries) => {
        const done = entries.filter((entry) => entry.completed);
        const counts = new Map<string, number>();
        for (const entry of done) {
          const who = entry.completedBy.trim() || 'Unassigned';
          counts.set(who, (counts.get(who) ?? 0) + 1);
        }
        return {
          date: entries[0]?.webinarDate ?? '',
          total: entries.length,
          completed: done.length,
          percent: entries.length > 0 ? Math.round((done.length / entries.length) * 100) : 0,
          contributors: [...counts.entries()].map(([name, count]) => ({ name, count })),
          pending: entries.filter((entry) => !entry.completed),
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [allChecklists, client]);

  /** Steps this client's webinars miss most often - the recurring problem. */
  const repeatMisses = useMemo(() => {
    const counts = new Map<number, { stepName: string; times: number }>();
    for (const webinar of webinars) {
      for (const step of webinar.pending) {
        const found = counts.get(step.stepNumber);
        counts.set(step.stepNumber, {
          stepName: step.stepName,
          times: (found?.times ?? 0) + 1,
        });
      }
    }
    return [...counts.entries()]
      .map(([stepNumber, value]) => ({ stepNumber, ...value }))
      .filter((entry) => entry.times > 1)
      .sort((a, b) => b.times - a.times || a.stepNumber - b.stepNumber);
  }, [webinars]);

  const startEdit = () => {
    if (!client || !canEdit) return;
    const { id, ...rest } = client;
    setDraft(rest);
    setErrors({});
    setEditing(true);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client || !canEdit || !draft) return;

    const found = validateDraft(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    const trimmed = Object.fromEntries(
      Object.entries(draft).map(([key, value]) => [key, value.trim()])
    ) as ClientDraft;

    updateClient(client.id, trimmed);
    setEditing(false);
    setDraft(null);
  };

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-5xl mx-auto">
          <Header />
          <p className="text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

  if (!client) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-5xl mx-auto">
          <Header />
          <div className="bg-white rounded-lg shadow-lg p-10 text-center">
            <p className="text-gray-600 mb-4">Ye client nahi mila.</p>
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold">
              ← Dashboard pe wapas
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const totalSteps = webinars.reduce((sum, w) => sum + w.total, 0);
  const doneSteps = webinars.reduce((sum, w) => sum + w.completed, 0);
  const stats = [
    { label: 'Webinars', value: webinars.length },
    { label: 'Steps completed', value: `${doneSteps} / ${totalSteps}` },
    {
      label: 'Average completion',
      value: `${webinars.length > 0 ? Math.round(webinars.reduce((s, w) => s + w.percent, 0) / webinars.length) : 0}%`,
    },
  ];

  const details = [
    { label: 'Coach', value: client.coachName },
    { label: 'Zoom Email', value: client.zoomEmail },
    { label: 'WhatsApp Group', value: client.whatsappGroup },
    { label: 'Landing Page', value: client.landingPage },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Header />

        <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
          ← Dashboard
        </Link>

        <div className="mt-3 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {client.id}
            </span>
            <h1 className="text-4xl font-bold text-gray-800">{client.name}</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-lg p-5">
              <p className="text-sm font-semibold text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white">📋 Client Details</h2>
            {canEdit && !editing && (
              <button
                onClick={startEdit}
                className="bg-white/95 text-blue-700 font-semibold text-sm rounded-lg px-4 py-2 hover:bg-white transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {editing && draft ? (
            <form onSubmit={handleSave} className="px-6 py-5">
              <ClientFields draft={draft} errors={errors} onChange={setDraft} />
              <div className="flex gap-3 mt-5">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setDraft(null);
                  }}
                  className="text-gray-600 font-semibold px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="px-6 py-5">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {details.map((item) => (
                  <div key={item.label}>
                    <dt className="text-sm font-semibold text-gray-500">{item.label}</dt>
                    <dd className="text-gray-800 break-words">
                      {item.value || <span className="text-gray-400">Abhi nahi bhara</span>}
                    </dd>
                  </div>
                ))}
                <div className="md:col-span-2">
                  <dt className="text-sm font-semibold text-gray-500">Notes</dt>
                  <dd className="text-gray-800 whitespace-pre-wrap">
                    {client.notes || <span className="text-gray-400">Abhi nahi bhara</span>}
                  </dd>
                </div>
              </dl>
              {!canEdit && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mt-5">
                  🔒 Sirf Team Lead (Admin) ye details badal sakta hai.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Steps that go wrong again and again */}
        {repeatMisses.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                ⚠️ Baar baar chhoot rahe steps
              </h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-3">
                Ye steps is client ke ek se zyada webinars me pending rahe. Galtiyon
                ki jad yahi hoti hai.
              </p>
              <ul className="divide-y divide-gray-200">
                {repeatMisses.map((miss) => (
                  <li key={miss.stepNumber} className="py-2 flex items-center justify-between gap-3">
                    <span className="text-gray-700">
                      <span className="inline-block bg-red-50 text-red-700 rounded px-1.5 text-xs font-semibold mr-2">
                        {miss.stepNumber}
                      </span>
                      {miss.stepName}
                    </span>
                    <span className="text-sm font-semibold text-red-600 shrink-0">
                      {miss.times} webinars
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* This client's webinars */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white">🎥 Webinars</h2>
            <Link
              href="/checklist"
              className="bg-white/95 text-blue-700 font-semibold text-sm rounded-lg px-4 py-2 hover:bg-white transition-colors"
            >
              Open checklist →
            </Link>
          </div>

          {webinars.length === 0 ? (
            <p className="px-6 py-10 text-center text-gray-500">
              Is client ka koi webinar abhi track nahi hua.
            </p>
          ) : (
            <div className="divide-y divide-gray-200">
              {webinars.map((webinar) => (
                <div key={webinar.date} className="px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <p className="font-semibold text-gray-800">{webinar.date}</p>
                    <span
                      className={`text-lg font-bold ${
                        webinar.percent === 100 ? 'text-green-600' : 'text-blue-600'
                      }`}
                    >
                      {webinar.percent}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${webinar.percent}%` }}
                    />
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    <strong>{webinar.completed}</strong> of <strong>{webinar.total}</strong> steps
                    {webinar.contributors.length > 0 && (
                      <>
                        {' · '}
                        {webinar.contributors.map((c) => `${c.name} (${c.count})`).join(', ')}
                      </>
                    )}
                  </p>

                  {webinar.pending.length > 0 && (
                    <p className="text-sm text-red-600 mt-1">
                      {webinar.pending.length} steps pending
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

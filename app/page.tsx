'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import ClientManager from '@/components/ClientManager';
import { useClients } from '@/lib/clients';
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

interface WebinarSummary {
  key: string;
  webinarDate: string;
  clientName: string;
  completed: number;
  total: number;
  percent: number;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const canCreateClient = can(role, 'client:create');
  const canEditClient = can(role, 'client:edit');
  const canDeleteClient = can(role, 'client:delete');

  const { clients, addClient, updateClient, removeClient } = useClients();
  const [allChecklists, setAllChecklists] = useState<Record<string, ChecklistEntry[]>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('webinar-checklists');
      if (saved) setAllChecklists(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to load checklists:', error);
    }
  }, []);

  const webinars = useMemo<WebinarSummary[]>(() => {
    return Object.entries(allChecklists)
      .map(([key, entries]) => {
        const total = entries.length;
        const completed = entries.filter((entry) => entry.completed).length;
        return {
          key,
          webinarDate: entries[0]?.webinarDate ?? '',
          clientName: entries[0]?.clientName ?? '',
          completed,
          total,
          percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.webinarDate.localeCompare(a.webinarDate));
  }, [allChecklists]);

  const totals = useMemo(() => {
    const steps = webinars.reduce((sum, w) => sum + w.total, 0);
    const done = webinars.reduce((sum, w) => sum + w.completed, 0);
    return {
      steps,
      done,
      percent: steps > 0 ? Math.round((done / steps) * 100) : 0,
    };
  }, [webinars]);

  const stats = [
    { label: 'Clients', value: clients.length, accent: 'text-blue-600' },
    { label: 'Webinars tracked', value: webinars.length, accent: 'text-indigo-600' },
    { label: 'Steps completed', value: `${totals.done} / ${totals.steps}`, accent: 'text-green-600' },
    { label: 'Overall progress', value: `${totals.percent}%`, accent: 'text-emerald-600' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Header />

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Dashboard</h1>
          <p className="text-gray-600">
            Clients, webinars aur team progress ek jagah
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-lg p-5">
              <p className="text-sm font-semibold text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.accent}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Clients - admin only for add/edit/delete */}
        <div className="mb-8">
          <ClientManager
            clients={clients}
            canCreate={canCreateClient}
            canEdit={canEditClient}
            canDelete={canDeleteClient}
            onCreate={addClient}
            onUpdate={updateClient}
            onDelete={removeClient}
          />
        </div>

        {/* Webinar progress */}
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
              Abhi koi webinar track nahi ho raha. Checklist kholo aur date + client
              choose karke shuru karo.
            </p>
          ) : (
            <div className="divide-y divide-gray-200">
              {webinars.map((webinar) => (
                <div key={webinar.key} className="px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">{webinar.clientName}</h3>
                      <p className="text-sm text-gray-500">{webinar.webinarDate}</p>
                    </div>
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
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

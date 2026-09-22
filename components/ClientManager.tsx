'use client';

import { useState } from 'react';
import Link from 'next/link';
import ClientFields from '@/components/ClientFields';
import {
  EMPTY_DRAFT,
  validateDraft,
  type Client,
  type ClientDraft,
} from '@/lib/clients';

interface ClientManagerProps {
  clients: Client[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onCreate: (draft: ClientDraft) => void;
  onUpdate: (id: string, draft: ClientDraft) => void;
  onDelete: (id: string) => void;
}

export default function ClientManager({
  clients,
  canCreate,
  canEdit,
  canDelete,
  onCreate,
  onUpdate,
  onDelete,
}: ClientManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ClientDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientDraft, string>>>({});

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
  };

  const startCreate = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setFormOpen(true);
  };

  const startEdit = (client: Client) => {
    const { id, ...rest } = client;
    setEditingId(id);
    setDraft(rest);
    setErrors({});
    setFormOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Permission is re-checked here, not just on the button that opened this.
    if (editingId ? !canEdit : !canCreate) return;

    const found = validateDraft(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    const trimmed = Object.fromEntries(
      Object.entries(draft).map(([key, value]) => [key, value.trim()])
    ) as ClientDraft;

    if (editingId) {
      onUpdate(editingId, trimmed);
    } else {
      onCreate(trimmed);
    }
    closeForm();
  };

  const handleDelete = (client: Client) => {
    if (!canDelete) return;
    if (!confirm(`"${client.name}" ko delete karein? Iska checklist data bana rahega.`)) return;
    onDelete(client.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">🏢 Clients</h2>
        {canCreate && !formOpen && (
          <button
            onClick={startCreate}
            className="bg-white/95 text-blue-700 font-semibold text-sm rounded-lg px-4 py-2 hover:bg-white transition-colors"
          >
            + Add Client
          </button>
        )}
      </div>

      {!canCreate && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-sm text-amber-800">
          🔒 Sirf Team Lead (Admin) client add ya edit kar sakta hai.
        </div>
      )}

      {formOpen && (
        <form onSubmit={handleSubmit} className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit client' : 'New client'}
          </h3>

          <ClientFields draft={draft} errors={errors} onChange={setDraft} />

          <div className="flex gap-3 mt-5">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              {editingId ? 'Save changes' : 'Add client'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="text-gray-600 font-semibold px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {clients.length === 0 ? (
        <p className="px-6 py-10 text-center text-gray-500">
          Abhi koi client nahi hai.
          {canCreate ? ' "Add Client" se pehla client banao.' : ''}
        </p>
      ) : (
        <div className="divide-y divide-gray-200">
          {clients.map((client) => (
            <div key={client.id} className="px-6 py-4 hover:bg-blue-50 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="inline-block bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      {client.id}
                    </span>
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-lg font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      {client.name}
                    </Link>
                  </div>
                  {client.coachName && client.coachName !== client.name && (
                    <p className="text-sm text-gray-600 mt-1">Coach: {client.coachName}</p>
                  )}

                  <dl className="mt-2 text-sm text-gray-500 space-y-0.5">
                    {client.zoomEmail && <dd>📧 {client.zoomEmail}</dd>}
                    {client.whatsappGroup && (
                      <dd className="truncate">💬 {client.whatsappGroup}</dd>
                    )}
                    {client.landingPage && <dd className="truncate">🔗 {client.landingPage}</dd>}
                  </dl>
                </div>

                {(canEdit || canDelete) && (
                  <div className="flex gap-2 shrink-0">
                    {canEdit && (
                      <button
                        onClick={() => startEdit(client)}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(client)}
                        className="text-sm font-semibold text-red-600 hover:text-red-800 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

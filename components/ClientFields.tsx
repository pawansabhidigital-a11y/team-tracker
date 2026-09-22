'use client';

import type { ClientDraft } from '@/lib/clients';

interface ClientFieldsProps {
  draft: ClientDraft;
  errors: Partial<Record<keyof ClientDraft, string>>;
  onChange: (draft: ClientDraft) => void;
}

const TEXT_FIELDS: { key: keyof ClientDraft; label: string; placeholder: string; wide?: boolean }[] = [
  { key: 'name', label: 'Client Name *', placeholder: 'Ritu' },
  { key: 'coachName', label: 'Coach Name *', placeholder: 'Ritu' },
  { key: 'zoomEmail', label: 'Zoom Email', placeholder: 'zoom@example.com' },
  { key: 'whatsappGroup', label: 'WhatsApp Group', placeholder: 'https://chat.whatsapp.com/...' },
  { key: 'landingPage', label: 'Landing Page', placeholder: 'https://example.com/webinar', wide: true },
];

export default function ClientFields({ draft, errors, onChange }: ClientFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {TEXT_FIELDS.map((field) => (
        <div key={field.key} className={field.wide ? 'md:col-span-2' : ''}>
          <label
            htmlFor={`client-${field.key}`}
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {field.label}
          </label>
          <input
            id={`client-${field.key}`}
            type="text"
            value={draft[field.key]}
            placeholder={field.placeholder}
            onChange={(e) => onChange({ ...draft, [field.key]: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors[field.key] ? 'border-red-400 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors[field.key] && <p className="text-xs text-red-600 mt-1">{errors[field.key]}</p>}
        </div>
      ))}

      <div className="md:col-span-2">
        <label htmlFor="client-notes" className="block text-sm font-semibold text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          id="client-notes"
          value={draft.notes}
          onChange={(e) => onChange({ ...draft, notes: e.target.value })}
          placeholder="Anything else about this client - timings, preferences, contact numbers..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

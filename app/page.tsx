'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Checklist from '@/components/Checklist';
import Header from '@/components/Header';
import { clients, teamMembers, steps } from '@/lib/data';
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

export default function Home() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const canComplete = can(role, 'checklist:complete');
  const canNote = can(role, 'checklist:note');
  const canAssign = can(role, 'checklist:assign');
  const canReset = can(role, 'checklist:reset');

  const [selectedWebinarDate, setSelectedWebinarDate] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [checklist, setChecklist] = useState<ChecklistEntry[]>([]);
  const [allChecklists, setAllChecklists] = useState<Record<string, ChecklistEntry[]>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('webinar-checklists');
    if (saved) {
      try {
        setAllChecklists(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load checklists:', e);
      }
    }
  }, []);

  // Save to localStorage whenever allChecklists changes
  useEffect(() => {
    localStorage.setItem('webinar-checklists', JSON.stringify(allChecklists));
  }, [allChecklists]);

  // Load checklist when date or client changes
  useEffect(() => {
    if (selectedWebinarDate && selectedClient) {
      const key = `${selectedWebinarDate}-${selectedClient}`;
      const existing = allChecklists[key];

      if (existing) {
        setChecklist(existing);
      } else {
        const newChecklist: ChecklistEntry[] = steps.map((step) => ({
          webinarDate: selectedWebinarDate,
          clientName: selectedClient,
          stepNumber: step.number,
          stepName: step.name,
          completed: false,
          completedBy: '',
          completedAt: '',
          notes: '',
          issuesFound: '',
        }));
        setChecklist(newChecklist);
        setAllChecklists({
          ...allChecklists,
          [key]: newChecklist,
        });
      }
    }
  }, [selectedWebinarDate, selectedClient, allChecklists]);

  const handleStepUpdate = (stepNumber: number, field: string, value: any) => {
    // Checked here as well as on the inputs, so a disabled control is not the
    // only thing standing between a role and an edit it may not make.
    if (field === 'completed' && !canComplete) return;
    if (field === 'completedBy' && !canAssign) return;
    if ((field === 'notes' || field === 'issuesFound') && !canNote) return;

    const updatedChecklist = checklist.map((item) => {
      if (item.stepNumber === stepNumber) {
        const updatedItem = { ...item, [field]: value };

        // Auto-fill timestamp when marked complete
        if (field === 'completed' && value === true && !item.completedAt) {
          updatedItem.completedAt = new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        }

        // Clear timestamp when unmarked
        if (field === 'completed' && value === false) {
          updatedItem.completedAt = '';
          updatedItem.completedBy = '';
        }

        return updatedItem;
      }
      return item;
    });

    setChecklist(updatedChecklist);

    // Update allChecklists
    const key = `${selectedWebinarDate}-${selectedClient}`;
    setAllChecklists({
      ...allChecklists,
      [key]: updatedChecklist,
    });
  };

  const handleReset = () => {
    if (!canReset) return;
    if (!selectedWebinarDate || !selectedClient) return;
    if (!confirm('Is checklist ke saare steps reset kar dein?')) return;

    const cleared: ChecklistEntry[] = steps.map((step) => ({
      webinarDate: selectedWebinarDate,
      clientName: selectedClient,
      stepNumber: step.number,
      stepName: step.name,
      completed: false,
      completedBy: '',
      completedAt: '',
      notes: '',
      issuesFound: '',
    }));

    setChecklist(cleared);
    setAllChecklists({
      ...allChecklists,
      [`${selectedWebinarDate}-${selectedClient}`]: cleared,
    });
  };

  // Calculate completion percentage
  const totalSteps = checklist.length;
  const completedCount = checklist.filter((item) => item.completed).length;
  const completionPercentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <Header />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎥 Sabhi Digital Webinar Checklist
          </h1>
          <p className="text-gray-600">Track team accountability for webinar setup and execution</p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Date Picker */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              📅 Webinar Date
            </label>
            <input
              type="date"
              value={selectedWebinarDate}
              onChange={(e) => setSelectedWebinarDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            />
          </div>

          {/* Client Selector */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <label className="block text-lg font-semibold text-gray-800 mb-3">
              🏢 Client Name
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.name}>
                  {client.name} - {client.coachName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        {selectedWebinarDate && selectedClient && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Progress</h3>
              <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-3">
              <strong>{completedCount}</strong> of <strong>{totalSteps}</strong> steps completed
            </p>

            {canReset && (
              <button
                onClick={handleReset}
                className="mt-4 text-sm font-semibold text-red-600 hover:text-red-800 border border-red-300 rounded-lg px-4 py-2 hover:bg-red-50 transition-colors"
              >
                Reset checklist
              </button>
            )}
          </div>
        )}

        {/* Checklist */}
        {selectedWebinarDate && selectedClient ? (
          <Checklist
            checklist={checklist}
            teamMembers={teamMembers}
            onStepUpdate={handleStepUpdate}
            canComplete={canComplete}
            canNote={canNote}
            canAssign={canAssign}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              Please select a webinar date and client to begin
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

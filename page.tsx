'use client';

import { useState, useEffect } from 'react';
import Checklist from '@/components/Checklist';
import { clients, teamMembers, steps } from '@/lib/data';

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
  const [selectedWebinarDate, setSelectedWebinarDate] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [checklist, setChecklist] = useState<ChecklistEntry[]>([]);
  const [allChecklists, setAllChecklists] = useState<ChecklistEntry[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('webinar-checklists');
    if (saved) {
      setAllChecklists(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever checklist changes
  useEffect(() => {
    localStorage.setItem('webinar-checklists', JSON.stringify(allChecklists));
  }, [allChecklists]);

  // Load checklist for selected webinar
  useEffect(() => {
    if (selectedWebinarDate && selectedClient) {
      const saved = allChecklists.filter(
        (item) =>
          item.webinarDate === selectedWebinarDate &&
          item.clientName === selectedClient
      );

      if (saved.length === 0) {
        // Create new checklist
        const newChecklist = steps.map((step) => ({
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
      } else {
        setChecklist(saved);
      }
    }
  }, [selectedWebinarDate, selectedClient, allChecklists]);

  const handleStepUpdate = (
    stepNumber: number,
    field: string,
    value: any
  ) => {
    const updated = checklist.map((item) => {
      if (item.stepNumber === stepNumber) {
        const updatedItem = { ...item, [field]: value };

        // Auto-fill timestamp and current user when marking complete
        if (field === 'completed' && value === true) {
          updatedItem.completedAt = new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        }

        return updatedItem;
      }
      return item;
    });

    setChecklist(updated);

    // Update global list
    const filtered = allChecklists.filter(
      (item) =>
        !(
          item.webinarDate === selectedWebinarDate &&
          item.clientName === selectedClient
        )
    );
    setAllChecklists([...filtered, ...updated]);
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalSteps = checklist.length;
  const completionPercentage =
    totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📋 Sabhi Digital - Webinar Checklist
          </h1>
          <p className="text-gray-600">
            Track webinar setup steps, mark completion, and monitor team progress
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Webinar Date Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Webinar Date
            </label>
            <input
              type="date"
              value={selectedWebinarDate}
              onChange={(e) => setSelectedWebinarDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Client Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Client Name
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.name}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        {selectedWebinarDate && selectedClient && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Progress</h2>
              <span className="text-2xl font-bold text-blue-600">
                {completionPercentage}% ({completedCount}/{totalSteps})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Checklist */}
        {selectedWebinarDate && selectedClient && (
          <Checklist
            checklist={checklist}
            teamMembers={teamMembers}
            onStepUpdate={handleStepUpdate}
          />
        )}

        {/* Empty State */}
        {!selectedWebinarDate || !selectedClient ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              Select a webinar date and client to begin tracking steps →
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}

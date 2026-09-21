'use client';

import { useState } from 'react';

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

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface ChecklistProps {
  checklist: ChecklistEntry[];
  teamMembers: TeamMember[];
  onStepUpdate: (stepNumber: number, field: string, value: any) => void;
}

export default function Checklist({
  checklist,
  teamMembers,
  onStepUpdate,
}: ChecklistProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleExpand = (stepNumber: number) => {
    const expanded = new Set(expandedSteps);
    if (expanded.has(stepNumber)) {
      expanded.delete(stepNumber);
    } else {
      expanded.add(stepNumber);
    }
    setExpandedSteps(expanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">
          32-Step Webinar Setup Checklist
        </h2>
      </div>

      <div className="divide-y divide-gray-200">
        {checklist.map((item) => (
          <div
            key={item.stepNumber}
            className={`transition-all duration-200 ${
              item.completed ? 'bg-green-50' : 'bg-white'
            } hover:bg-blue-50`}
          >
            {/* Main Row */}
            <div className="px-6 py-4">
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={(e) =>
                    onStepUpdate(item.stepNumber, 'completed', e.target.checked)
                  }
                  className="w-6 h-6 mt-1 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                />

                {/* Step Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Step {item.stepNumber}
                    </span>
                    <h3
                      className={`text-lg font-semibold ${
                        item.completed
                          ? 'line-through text-gray-500'
                          : 'text-gray-800'
                      }`}
                    >
                      {item.stepName}
                    </h3>
                  </div>

                  {/* Quick Info */}
                  {item.completed && (
                    <div className="text-sm text-gray-600 mt-2">
                      <div className="flex gap-4">
                        {item.completedBy && (
                          <span>
                            ✓ <strong>{item.completedBy}</strong>
                          </span>
                        )}
                        {item.completedAt && (
                          <span className="text-gray-500">{item.completedAt}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expand Button */}
                <button
                  onClick={() => toggleExpand(item.stepNumber)}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm px-3 py-1"
                >
                  {expandedSteps.has(item.stepNumber) ? '▼ Hide' : '▶ Details'}
                </button>
              </div>

              {/* Expanded Details */}
              {expandedSteps.has(item.stepNumber) && (
                <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Completed By */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Completed By
                    </label>
                    <select
                      value={item.completedBy}
                      onChange={(e) =>
                        onStepUpdate(item.stepNumber, 'completedBy', e.target.value)
                      }
                      disabled={!item.completed}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select team member...</option>
                      {teamMembers.map((member) => (
                        <option key={member.id} value={member.name}>
                          {member.name} ({member.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Completed At */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Completed At
                    </label>
                    <input
                      type="text"
                      value={item.completedAt}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                      placeholder="Auto-filled when completed"
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={item.notes}
                      onChange={(e) =>
                        onStepUpdate(item.stepNumber, 'notes', e.target.value)
                      }
                      placeholder="Add any notes about this step..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  {/* Issues Found */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Issues Found
                    </label>
                    <textarea
                      value={item.issuesFound}
                      onChange={(e) =>
                        onStepUpdate(item.stepNumber, 'issuesFound', e.target.value)
                      }
                      placeholder="Describe any issues encountered..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <strong>Completed:</strong> {checklist.filter((item) => item.completed).length} /{' '}
          {checklist.length} steps
        </div>
      </div>
    </div>
  );
}

'use client';

import { signOut, useSession } from 'next-auth/react';
import { ROLE_LABELS } from '@/lib/rbac';

export default function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg px-6 py-4 mb-8 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold">
          {user.name?.charAt(0).toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="font-semibold text-gray-800 leading-tight">{user.name}</p>
          <p className="text-sm text-gray-500 leading-tight">
            {ROLE_LABELS[user.role]}
          </p>
        </div>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="text-sm font-semibold text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}

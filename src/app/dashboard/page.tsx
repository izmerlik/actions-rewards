'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Actions from '@/components/Actions';
import Rewards from '@/components/Rewards';

const TABS = [
  { key: 'actions', label: 'Actions' },
  { key: 'rewards', label: 'Rewards' },
];

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'actions' | 'rewards'>('actions');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Actions & Rewards</h1>
              <p className="text-sm text-gray-500">XP Balance: {user.xp}</p>
            </div>
            <button
              onClick={signOut}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs for mobile */}
        <div className="mb-4 flex md:hidden">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as 'actions' | 'rewards')}
              className={`flex-1 py-2 text-center rounded-t-lg font-semibold transition-colors
                ${selectedTab === tab.key
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:flex md:space-x-8">
          {/* Actions */}
          <div
            className={
              `md:w-1/2 ${selectedTab !== 'actions' ? 'hidden' : ''} md:block transition-all`
            }
          >
            <Actions />
          </div>
          {/* Rewards */}
          <div
            className={
              `md:w-1/2 ${selectedTab !== 'rewards' ? 'hidden' : ''} md:block transition-all`
            }
          >
            <Rewards />
          </div>
        </div>
      </main>
    </div>
  );
} 
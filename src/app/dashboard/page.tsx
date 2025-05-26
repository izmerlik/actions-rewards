'use client';

import { Button, Paper, Tab, Tabs, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import Actions from '@/components/Actions';
import Rewards from '@/components/Rewards';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);

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
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar for large screens */}
      <aside className="hidden lg:flex lg:w-40 bg-white shadow-sm lg:h-screen lg:sticky lg:top-0 flex-shrink-0 flex-col justify-between items-start px-3 pt-2 border-r border-gray-200">
        <div>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }} style={{ marginTop: '-1px' }}>
            {user.xp} XP
          </Typography>
        </div>
        <div className="w-full mt-auto pb-4">
          {user.isGuest ? (
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              href="/auth/signin"
              fullWidth
              size="small"
            >
              Log In
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              onClick={signOut}
              fullWidth
              size="small"
            >
              Sign Out
            </Button>
          )}
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 px-4 pt-2 pb-6 sm:px-6 lg:px-8 bg-gray-50 min-h-screen relative">
        {/* Fixed header for all screens below lg */}
        <div className="fixed top-0 left-0 w-full z-10 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14 lg:hidden">
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {user.xp} XP
          </Typography>
          {user.isGuest ? (
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              href="/auth/signin"
              size="small"
            >
              Log In
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              onClick={signOut}
              size="small"
            >
              Sign Out
            </Button>
          )}
        </div>
        {/* Add top padding to main content for all screens below lg to avoid overlap with fixed header */}
        <div className="block lg:hidden" style={{ height: '56px' }} />
        {/* Tabs for mobile only (below md) */}
        <Paper elevation={0} sx={{ borderRadius: 2, mb: 3, background: 'transparent' }} className="block md:hidden">
          <Tabs
            value={selectedTab}
            onChange={(_, newValue) => setSelectedTab(newValue)}
            variant="fullWidth"
            TabIndicatorProps={{
              style: { height: 4, borderRadius: 2, background: '#4f46e5' }
            }}
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: 18,
                minHeight: 48,
                borderRadius: 2,
              },
              '& .Mui-selected': {
                color: '#4f46e5',
                background: '#f3f4f6',
              },
              '& .MuiTabs-flexContainer': {
                gap: 2,
              },
            }}
          >
            <Tab label="Actions" />
            <Tab label="Rewards" />
          </Tabs>
        </Paper>
        {/* 2 columns for md and up */}
        <div className="hidden md:flex md:space-x-4">
          <div style={{ width: '100%' }}>
            <Actions />
          </div>
          <div style={{ width: '100%' }}>
            <Rewards />
          </div>
        </div>
        {/* 1 column with tabs for mobile */}
        <div className="md:hidden">
          <div className={selectedTab === 0 ? '' : 'hidden'} style={{ width: '100%' }}>
            <Actions />
          </div>
          <div className={selectedTab === 1 ? '' : 'hidden'} style={{ width: '100%' }}>
            <Rewards />
          </div>
        </div>
      </main>
    </div>
  );
} 
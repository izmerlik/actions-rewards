'use client';

import { Button, Paper, Tab, Tabs, Typography } from '@mui/material';
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div>
              <Typography variant="h6" component="p" sx={{ fontWeight: 700, color: 'text.primary' }}>
                XP Balance: {user.xp}
              </Typography>
            </div>
            <Button
              variant="outlined"
              color="primary"
              onClick={signOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs for mobile only */}
        <Paper elevation={0} sx={{ borderRadius: 2, mb: 3, background: 'transparent' }} className="md:hidden">
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

        <div className="md:flex md:space-x-8">
          {/* Actions */}
          <div className={selectedTab === 0 ? '' : 'hidden md:block'} style={{ width: '100%' }}>
            <Actions />
          </div>
          {/* Rewards */}
          <div className={selectedTab === 1 ? '' : 'hidden md:block'} style={{ width: '100%' }}>
            <Rewards />
          </div>
        </div>
      </main>
    </div>
  );
} 
'use client';

import { Box, Button, Heading, Text, useBreakpointValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import Actions from '@/components/Actions';
import Rewards from '@/components/Rewards';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, loading, signOut, guestSignIn } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const initializeUser = async () => {
      if (!loading && !user) {
        try {
          await guestSignIn();
        } catch (err) {
          console.error('Failed to sign in as guest:', err);
        }
      }
    };

    initializeUser();
  }, [loading, user, guestSignIn]);

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Box textAlign="center">
          <Box h={8} w={8} borderRadius="full" borderWidth={4} borderColor="gray.200" borderTopColor="purple.600" animation="spin 1s linear infinite" mx="auto" />
          <Text mt={4} color="gray.600">Loading...</Text>
        </Box>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Box textAlign="center">
          <Box h={8} w={8} borderRadius="full" borderWidth={4} borderColor="gray.200" borderTopColor="purple.600" animation="spin 1s linear infinite" mx="auto" />
          <Text mt={4} color="gray.600">Initializing...</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box display={{ base: 'flex' }} flexDirection={{ base: 'column', lg: 'row' }} minH="100vh" bg="gray.50">
      {/* Sidebar for large screens */}
      <Box display={{ base: 'none', lg: 'flex' }} w="40" bg="gray.50" boxShadow="sm" h="100vh" position="sticky" top={0} flexShrink={0} flexDirection="column" justifyContent="space-between" alignItems="flex-start" px={3} pt={2} borderRightWidth={1} borderColor="gray.200">
        <Box>
          <Heading as="h2" size="md" fontWeight={600} color="gray.800" mb={1} mt={-1}>{user.xp} XP</Heading>
        </Box>
        <Box w="full" mt="auto" pb={4}>
          {user.isGuest ? (
            <Button
              variant="outline"
              colorScheme="purple"
              w="full"
              size="sm"
              onClick={() => router.push('/auth/signin')}
            >
              Log In
            </Button>
          ) : (
            <Button
              variant="outline"
              colorScheme="purple"
              onClick={signOut}
              w="full"
              size="sm"
            >
              Sign Out
            </Button>
          )}
        </Box>
      </Box>
      {/* Main content */}
      <Box flex={1} px={12} pt={2} pb={6} bg="gray.50" minH="100vh" position="relative">
        {/* Fixed header for all screens below lg */}
        <Box display={{ base: 'flex', lg: 'none' }} position="fixed" top={0} left={0} w="full" zIndex={10} bg="gray.50" borderBottomWidth={1} borderColor="gray.200" alignItems="center" justifyContent="space-between" px={4} h={14}>
          <Heading as="h2" size="md" fontWeight={600} color="gray.800">{user.xp} XP</Heading>
          {user.isGuest ? (
            <Button
              variant="outline"
              colorScheme="purple"
              size="sm"
              onClick={() => router.push('/auth/signin')}
            >
              Log In
            </Button>
          ) : (
            <Button
              variant="outline"
              colorScheme="purple"
              onClick={signOut}
              size="sm"
            >
              Sign Out
            </Button>
          )}
        </Box>
        {/* Add top padding to main content for all screens below lg to avoid overlap with fixed header */}
        <Box display={{ base: 'block', lg: 'none' }} h="56px" />
        {/* Tabs for mobile only (below md) */}
        {isMobile ? (
          <>
            <Box display="flex" mb={3} borderRadius={8} bg="white" borderWidth={1} borderColor="gray.200" overflow="hidden" w="fit-content" boxShadow="sm">
              <button
                type="button"
                style={{
                  fontWeight: 600,
                  fontSize: 18,
                  borderRadius: 2,
                  background: selectedTab === 0 ? '#f3f4f6' : 'transparent',
                  color: selectedTab === 0 ? '#4f46e5' : undefined,
                  padding: '8px 16px',
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.2s',
                }}
                onClick={() => setSelectedTab(0)}
              >
                Actions
              </button>
              <button
                type="button"
                style={{
                  fontWeight: 600,
                  fontSize: 18,
                  borderRadius: 2,
                  background: selectedTab === 1 ? '#f3f4f6' : 'transparent',
                  color: selectedTab === 1 ? '#4f46e5' : undefined,
                  padding: '8px 16px',
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background 0.2s',
                }}
                onClick={() => setSelectedTab(1)}
              >
                Rewards
              </button>
            </Box>
            {selectedTab === 0 ? <Actions /> : <Rewards />}
          </>
        ) : (
          <Box display={{ base: 'none', md: 'flex' }} gap={12} justifyContent="center" alignItems="start">
            <Box w="full" maxW="420px"><Actions /></Box>
            <Box w="full" maxW="420px"><Rewards /></Box>
          </Box>
        )}
      </Box>
    </Box>
  );
} 
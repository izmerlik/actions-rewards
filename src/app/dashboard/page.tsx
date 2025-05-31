'use client';

import { Box, Button, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import ErrorHandler from '@/components/ErrorHandler';
import Actions from '@/components/Actions';
import Rewards from '@/components/Rewards';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, loading, signOut, guestSignIn } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      if (!loading && !user) {
        try {
          await guestSignIn();
        } catch (err) {
          console.error('Failed to sign in as guest:', err);
          setError(err instanceof Error ? err : new Error('Failed to sign in as guest'));
        }
      }
    };

    initializeUser();
  }, [loading, user, guestSignIn]);

  const handleReset = () => {
    setError(null);
    window.location.reload();
  };

  if (error) {
    return <ErrorHandler error={error} onReset={handleReset} />;
  }

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Box textAlign="center">
          <Spinner size="xl" color="black" thickness="4px" speed="0.65s" />
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
    <Box minH="100vh" bg="gray.50">
      {/* Sidebar + 2 columns (xl and up) */}
      <Box display={{ base: 'none', xl: 'flex' }} flexDirection="row" minH="100vh">
        {/* Sidebar */}
        <Box w="48" bg="gray.50" boxShadow="sm" h="100vh" position="sticky" top={0} flexShrink={0} display="flex" flexDirection="column" justifyContent="space-between" alignItems="flex-start" px={4} pt={2} borderRightWidth={1} borderColor="gray.200">
          <Box>
            <Heading as="h2" size="md" fontWeight={600} mb={1} mt={6} px={0}>
              <Text as="span" color="gray.800">{user.xp}</Text>
              <Text as="span" color="gray.800"> XP</Text>
            </Heading>
          </Box>
          <Box w="full" mt="auto" pb={4}>
            {user.isGuest ? (
              <Button
                variant="solid"
                bg="black"
                color="white"
                _hover={{ bg: 'gray.800' }}
                _active={{ bg: 'gray.900' }}
                w="full"
                size="sm"
                h="48px"
                borderRadius="8px"
                fontSize="md"
                onClick={() => router.push('/auth/signin')}
              >
                Log In
              </Button>
            ) : (
              <Button
                variant="outline"
                borderColor="gray.200"
                color="black"
                onClick={signOut}
                w="full"
                size="sm"
                h="48px"
                borderRadius="8px"
                fontSize="md"
              >
                Sign Out
              </Button>
            )}
          </Box>
        </Box>
        {/* 2 columns */}
        <Box flex={1} px={12} pt={2} pb={6} bg="gray.50" minH="100vh" position="relative">
          <Box display={{ base: 'none', xl: 'flex' }} gap={6} justifyContent="center" alignItems="start">
            <Box w="full" maxW="360px"><Actions /></Box>
            <Box w="full" maxW="360px"><Rewards /></Box>
          </Box>
        </Box>
      </Box>
      {/* Header + 2 columns (md to xl-1) */}
      <Box display={{ base: 'none', md: 'flex', xl: 'none' }} flexDirection="column" minH="100vh">
        {/* Header */}
        <Box display="flex" position="fixed" top={0} left={0} w="full" zIndex={10} bg="gray.50" borderBottomWidth={1} borderColor="gray.200" alignItems="center" justifyContent="space-between" px={4} h={14}>
          <Text fontSize="md" fontWeight={600} color="gray.800">{user.xp} XP</Text>
          {user.isGuest ? (
            <Button
              variant="solid"
              bg="black"
              color="white"
              _hover={{ bg: 'gray.800' }}
              _active={{ bg: 'gray.900' }}
              size="sm"
              w="90px"
              h="36px"
              borderRadius="8px"
              fontSize="sm"
              onClick={() => router.push('/auth/signin')}
            >
              Log In
            </Button>
          ) : (
            <Button
              variant="outline"
              borderColor="gray.200"
              color="black"
              onClick={signOut}
              size="sm"
              w="120px"
              h="48px"
              borderRadius="8px"
              fontSize="md"
            >
              Sign Out
            </Button>
          )}
        </Box>
        {/* Add top padding to main content to avoid overlap with fixed header */}
        <Box h="56px" />
        {/* 2 columns */}
        <Box flex={1} px={12} pt={2} pb={6} bg="gray.50" minH="100vh" position="relative">
          <Box display={{ base: 'none', md: 'flex', xl: 'none' }} gap={6} justifyContent="center" alignItems="start">
            <Box w="full" maxW="360px"><Actions /></Box>
            <Box w="full" maxW="360px"><Rewards /></Box>
          </Box>
        </Box>
      </Box>
      {/* Header + tabs (base to md-1) */}
      <Box display={{ base: 'flex', md: 'none' }} flexDirection="column" minH="100vh">
        {/* Header */}
        <Box display="flex" position="fixed" top={0} left={0} w="full" zIndex={10} bg="gray.50" borderBottomWidth={1} borderColor="gray.200" alignItems="center" justifyContent="space-between" px={4} h={14}>
          <Text fontSize="md" fontWeight={600} color="gray.800">{user.xp} XP</Text>
          {user.isGuest ? (
            <Button
              variant="solid"
              bg="black"
              color="white"
              _hover={{ bg: 'gray.800' }}
              _active={{ bg: 'gray.900' }}
              size="sm"
              w="90px"
              h="36px"
              borderRadius="8px"
              fontSize="sm"
              onClick={() => router.push('/auth/signin')}
            >
              Log In
            </Button>
          ) : (
            <Button
              variant="outline"
              borderColor="gray.200"
              color="black"
              onClick={signOut}
              size="sm"
              w="90px"
              h="36px"
              borderRadius="8px"
              fontSize="sm"
            >
              Sign Out
            </Button>
          )}
        </Box>
        {/* Add top padding to main content to avoid overlap with fixed header */}
        <Box h="56px" />
        {/* Tabs for mobile only (below md) */}
        <Box px={4} mt={4}>
          <Tabs
            index={selectedTab}
            onChange={setSelectedTab}
            isFitted
          >
            <TabList mb={3}>
              <Tab fontWeight={600} fontSize="md" color="gray.800">Actions</Tab>
              <Tab fontWeight={600} fontSize="md" color="gray.800">Rewards</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0} py={0}>
                <Actions />
              </TabPanel>
              <TabPanel px={0} py={0}>
                <Rewards />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Box>
  );
} 
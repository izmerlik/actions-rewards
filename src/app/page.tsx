'use client';

import { Box, Button, Text, Spinner } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading, error, guestSignIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const initializeUser = async () => {
      if (!loading) {
        if (!user) {
          try {
            await guestSignIn();
          } catch (err) {
            console.error('Failed to sign in as guest:', err);
          }
        }
        router.push('/dashboard');
      }
    };

    initializeUser();
  }, [loading, user, guestSignIn, router]);

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Box textAlign="center">
          <Spinner size="xl" color="purple.500" />
          <Text mt={4} color="gray.600">Loading...</Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Box textAlign="center">
          <Text color="red.500">Error: {error}</Text>
          <Button
            colorScheme="purple"
            onClick={() => window.location.reload()}
            mt={4}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  if (user) {
    if (user.isGuest) {
      // Don't show redirect message for guests, let useEffect handle redirect
      return null;
    }
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Box textAlign="center">
          <Text color="gray.600">Redirecting to dashboard...</Text>
          <Link href="/dashboard">
            <Button colorScheme="purple" mt={4}>
              Go to Dashboard
            </Button>
          </Link>
        </Box>
      </Box>
    );
  }

  return null;
}

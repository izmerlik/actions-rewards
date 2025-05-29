'use client';

import { Box, Button, Input, Heading, Text, Container, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { MdArrowBack, MdLogin } from 'react-icons/md';

import { useAuth } from '@/contexts/AuthContext';

interface AuthFormProps {}

function isAuthError(err: unknown): err is { code: string; message?: string } {
  return typeof err === 'object' && err !== null && 'code' in err;
}

export default function AuthForm({}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, signUp, googleSignIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      // If user not found, try to sign up
      if (isAuthError(err) && err.code === 'auth/user-not-found') {
        try {
          await signUp(email, password);
          router.push('/dashboard');
          return;
        } catch (signupErr: unknown) {
          setError(isAuthError(signupErr) ? signupErr.message || 'Sign up failed' : 'Sign up failed');
        }
      } else if (isAuthError(err) && err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (isAuthError(err) && err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(isAuthError(err) ? err.message || 'Sign in failed' : 'Sign in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" p={2} direction="column">
      <Container maxW="sm">
        <Box bg="white" p={8} borderRadius={8} boxShadow="md" display="flex" flexDirection="column" alignItems="center">
          <Button
            variant="ghost"
            alignSelf="flex-start"
            mb={2}
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
          >
            <MdArrowBack style={{ marginRight: 8 }} /> Go Back
          </Button>
          <Heading as="h1" size="lg" mb={2} textAlign="center">
            Log In or Sign Up
          </Heading>
          <Text color="gray.600" mb={4} textAlign="center">
            Enter your email and password to log in or create a new account
          </Text>

          <Box as="form" onSubmit={handleSubmit} mt={3} w="100%">
            {error && (
              <Box bg="red.100" color="red.700" p={3} mb={4} borderRadius={6} fontWeight={500} textAlign="center">
                {error}
              </Box>
            )}

            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              mb={3}
              disabled={loading}
              required
              autoFocus
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              mb={3}
              disabled={loading}
              required
            />

            <Button
              type="submit"
              w="100%"
              colorScheme="purple"
              mb={3}
              disabled={loading}
            >
              <MdLogin style={{ marginRight: 8 }} /> Continue
            </Button>

            <Box my={4} borderBottom="1px solid #e2e8f0" />
            <Text fontSize="sm" color="gray.500" textAlign="center" mb={2}>
              Or continue with
            </Text>

            <Button
              w="100%"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <FcGoogle style={{ marginRight: 8 }} /> Google
            </Button>
          </Box>
        </Box>
      </Container>
    </Flex>
  );
} 
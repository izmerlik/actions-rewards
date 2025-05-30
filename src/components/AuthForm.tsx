'use client';

import { Box, Button, Input, Heading, Text, Flex, IconButton, Skeleton } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { MdArrowBack } from 'react-icons/md';

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
    <Flex minH="100vh" align="center" justify="center" p={2} direction="column" bg="gray.50" position="relative">
      <Box maxW="400px" w="full">
        <Box bg="white" p={8} borderRadius="16px" borderWidth={1} borderColor="gray.200" boxShadow="sm" display="flex" flexDirection="column" alignItems="center" position="relative">
          <IconButton
            aria-label="Go back"
            icon={<MdArrowBack size={20} />}
            variant="outline"
            position="absolute"
            top={4}
            left={4}
            w="40px"
            h="40px"
            minW="40px"
            minH="40px"
            borderRadius="8px"
            fontSize="md"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
          />
          <Heading as="h2" size="md" fontWeight={600} color="gray.800" mb={1} mt={12}>
            Ready to Dive In?
          </Heading>
          <Text color="gray.600" mb={4} textAlign="center" mt={2}>
            Sign in or create a new account to begin
          </Text>

          <Box as="form" onSubmit={handleSubmit} mt={3} w="100%">
            {error && (
              <Box bg="red.100" color="red.700" p={3} mb={4} borderRadius={6} fontWeight={500} textAlign="center">
                {error}
              </Box>
            )}

            {loading ? (
              <>
                <Skeleton height="48px" mb={3} borderRadius="8px" />
                <Skeleton height="48px" mb={3} borderRadius="8px" />
                <Skeleton height="48px" mb={3} borderRadius="8px" />
                <Skeleton height="48px" borderRadius="8px" />
              </>
            ) : (
              <>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  mb={3}
                  disabled={loading}
                  required
                  autoFocus
                  size="md"
                  fontSize="md"
                  borderRadius="8px"
                  px={3}
                  h="48px"
                  _placeholder={{ color: 'gray.400', fontSize: 'md' }}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  mb={3}
                  disabled={loading}
                  required
                  size="md"
                  fontSize="md"
                  borderRadius="8px"
                  px={3}
                  h="48px"
                  _placeholder={{ color: 'gray.400', fontSize: 'md' }}
                />
                <Button
                  type="submit"
                  w="100%"
                  bg="black"
                  color="white"
                  _hover={{ bg: 'gray.800' }}
                  _active={{ bg: 'gray.900' }}
                  mb={3}
                  disabled={loading}
                  h="48px"
                  borderRadius="8px"
                >
                  Continue
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
                  h="48px"
                  borderRadius="8px"
                >
                  <FcGoogle style={{ marginRight: 8 }} /> Google
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Flex>
  );
} 
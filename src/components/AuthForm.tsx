'use client';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GoogleIcon from '@mui/icons-material/Google';
import LoginIcon from '@mui/icons-material/Login';
import { Alert, Box, Button, Container, Divider, Paper, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

interface AuthFormProps {}

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
      if (err && typeof err === 'object' && 'code' in err && (err as any).code === 'auth/user-not-found') {
        try {
          await signUp(email, password);
          router.push('/dashboard');
          return;
        } catch (signupErr: unknown) {
          setError((signupErr as any)?.message || 'Sign up failed');
        }
      } else if (err && typeof err === 'object' && 'code' in err && (err as any).code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err && typeof err === 'object' && 'code' in err && (err as any).code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError((err as any)?.message || 'Sign in failed');
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            variant="text"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            sx={{ alignSelf: 'flex-start', mb: 2 }}
          >
            Go Back
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            Log In or Sign Up
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Enter your email and password to log in or create a new account
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              startIcon={<LoginIcon />}
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Continue'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Or continue with
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              Google
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 
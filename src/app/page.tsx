'use client';

import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import { Box, Button, CircularProgress, Container, Paper, Typography } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading, error, guestSignIn } = useAuth();

  const handleGuestSignIn = async () => {
    try {
      await guestSignIn();
    } catch (err) {
      console.error('Guest sign in error:', err);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography color="error">Error: {error}</Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  if (user) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Redirecting to dashboard...
          </Typography>
          <Button
            component={Link}
            href="/dashboard"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    );
  }

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
          <Typography variant="h4" component="h1" gutterBottom>
            Actions & Rewards
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Track your actions and earn rewards
          </Typography>

          <Box sx={{ mt: 4, width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              component={Link}
              href="/auth/signin"
              variant="contained"
              fullWidth
              startIcon={<LoginIcon />}
            >
              Sign In
            </Button>
            <Button
              component={Link}
              href="/auth/signup"
              variant="outlined"
              fullWidth
              startIcon={<PersonAddIcon />}
            >
              Sign Up
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PersonIcon />}
              onClick={handleGuestSignIn}
              sx={{ mt: 1 }}
            >
              Continue as Guest
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

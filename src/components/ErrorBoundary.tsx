'use client';

import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
          <Box textAlign="center" p={8} maxW="md">
            <Heading as="h1" size="lg" mb={4} color="gray.800">
              Something went wrong
            </Heading>
            <Text color="gray.600" mb={6}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              colorScheme="black"
              size="lg"
            >
              Try again
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
} 
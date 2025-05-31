'use client';

import { Box, Button, Heading, Text, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';

interface ErrorHandlerProps {
  error: Error | null;
  onReset: () => void;
}

export default function ErrorHandler({ error, onReset }: ErrorHandlerProps) {
  const toast = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  }, [error, toast]);

  if (!error) return null;

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
      <Box textAlign="center" p={8} maxW="md">
        <Heading as="h1" size="lg" mb={4} color="gray.800">
          Oops! Something went wrong
        </Heading>
        <Text color="gray.600" mb={6}>
          {error.message || 'An unexpected error occurred'}
        </Text>
        <Button
          onClick={onReset}
          colorScheme="black"
          size="lg"
        >
          Try again
        </Button>
      </Box>
    </Box>
  );
} 
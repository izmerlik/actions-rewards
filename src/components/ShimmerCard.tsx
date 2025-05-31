import { Box, Skeleton, SkeletonCircle } from '@chakra-ui/react';

export default function ShimmerCard() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      bg="white"
      borderRadius="16px"
      borderWidth={1}
      borderColor="gray.200"
      p={4}
      mb={0}
    >
      <SkeletonCircle size="6" startColor="gray.200" endColor="gray.300" />
      <Box flex={1} minW={0} ml={4}>
        <Skeleton height="20px" width="70%" mb={2} borderRadius="6px" startColor="gray.200" endColor="gray.300" />
        <Skeleton height="16px" width="40%" borderRadius="6px" startColor="gray.200" endColor="gray.300" />
      </Box>
      <Skeleton height="48px" width="48px" borderRadius="8px" ml={4} startColor="gray.200" endColor="gray.300" />
    </Box>
  );
} 
'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const theme = extendTheme({
  fonts: {
    body: inter.style.fontFamily,
    heading: inter.style.fontFamily,
  },
  colors: {
    brand: {
      500: '#4f46e5', // indigo-600
    },
    gray: {
      50: '#FAFAFA',
      100: '#F4F4F5',
      200: '#E4E4E7',
      300: '#D4D4D8',
      400: '#A1A1AA',
      500: '#71717A',
      600: '#52525B',
      700: '#3F3F46',
      800: '#27272A',
      900: '#18181B',
    },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
} 
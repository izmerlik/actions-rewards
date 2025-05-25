'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#4f46e5', // indigo-600
    },
    secondary: {
      main: '#6b7280', // gray-500
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
} 
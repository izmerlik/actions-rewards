import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import ThemeRegistry from '@/components/ThemeRegistry';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Actions & Rewards",
  description: "Track your actions and earn rewards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <ThemeRegistry>
            <AuthProvider>
              <main className="min-h-screen">
                {children}
              </main>
            </AuthProvider>
          </ThemeRegistry>
        </ErrorBoundary>
      </body>
    </html>
  );
}

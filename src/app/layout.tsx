import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AuthProvider } from '@/contexts/AuthContext';
import ThemeRegistry from '@/components/ThemeRegistry';
import './globals.css';

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
        <ThemeRegistry>
          <AuthProvider>
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

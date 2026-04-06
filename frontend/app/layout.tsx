import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LibraNet – Distributed Multi-Branch Library',
  description:
    'LibraNet is a distributed multi-branch library management system. Borrow books, manage loans, and reserve copies across branches.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-200">
        <Navbar />
        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
          LibraNet &copy; {new Date().getFullYear()} — Distributed Library Management System
        </footer>
      </body>
    </html>
  );
}

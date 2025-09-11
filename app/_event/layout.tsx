'use client';
import { Inter } from 'next/font/google';
import '../globals.css';

import EventHeader from '@/components/EventHeader';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      <div className='min-h-screen flex flex-col'>
        <EventHeader />
        <main className='flex-1 px-4 sm:px-6 py-4 sm:py-6'>{children}</main>
        <Footer />
      </div>
    </div>
  );
}

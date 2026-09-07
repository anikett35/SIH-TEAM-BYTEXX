import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { DisasterProvider } from '@/context/DisasterContext';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'ByteX DSS | Emergency Evacuation & Decision Support System',
  description:
    'Disaster Decision Support System for intelligent identification of hazard zones, safe shelters, and immediate evacuation planning.',
  keywords: [
    'Disaster Management',
    'GIS Decision Support System',
    'Evacuation Planning',
    'Safe Shelters',
    'ByteX DSS',
  ],
  authors: [{ name: 'ByteX Disaster Decision Systems' }],
  icons: {
    icon: '/logo.webp',
    shortcut: '/logo.webp',
    apple: '/logo.webp',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} text-gray-800 text-sm bg-gray-100 leading-normal font-medium h-screen antialiased flex flex-col lg:flex-row overflow-hidden font-sans`}>
        <DisasterProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-gray-100">
            <TopHeader />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-100 font-sans">
              {children}
            </main>
          </div>
        </DisasterProvider>
      </body>
    </html>
  );
}

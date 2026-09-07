import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import { DisasterProvider } from '@/context/DisasterContext';
import { ThemeProvider } from '@/context/ThemeContext';
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('bytex-theme');
                  var isDark = saved === 'dark' || (!saved && (!window.matchMedia || !window.matchMedia('(prefers-color-scheme: light)').matches));
                  if (isDark) {
                    document.documentElement.classList.add('dark', 'bytex-theme');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.remove('dark', 'bytex-theme');
                    document.documentElement.classList.add('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} text-gray-800 dark:text-gray-200 text-sm bg-gray-100 dark:bg-[#030a13] leading-normal font-medium h-screen antialiased flex flex-col lg:flex-row overflow-hidden font-sans transition-colors duration-150`}>
        <ThemeProvider>
          <DisasterProvider>
            <Sidebar />
            <div className="app-shell flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-gray-100 dark:bg-[#030a13] transition-colors duration-150">
              <TopHeader />
              <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 bg-gray-100 dark:bg-[#030a13] font-sans transition-colors duration-150">
                {children}
              </main>
            </div>
          </DisasterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';

export const metadata: Metadata = {
  title: 'Jankoti ATS Checker — AI-Powered Resume Analyzer',
  description:
    'Jankoti - Igniting Future Ideas. Analyze your resume against any job description. Get ATS scores, keyword matching, skill gap analysis, and AI suggestions.',
  keywords: ['Jankoti', 'ATS checker', 'resume analyzer', 'ATS score', 'keyword matching', 'job search'],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen text-slate-800 antialiased flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

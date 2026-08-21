import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#080D1A] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}

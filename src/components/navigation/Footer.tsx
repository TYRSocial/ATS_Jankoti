"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-lg w-fit">
              <Image
                src="/jankotilogo.png"
                alt="Jankoti Logo"
                width={140}
                height={38}
                className="object-contain"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect with top employers and optimize your resume with AI-driven ATS score insights, keyword matching, and formatting compliance.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">ATS Analyzer</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/upload" className="hover:text-purple-400 transition-colors">
                  Upload Resume
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-purple-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-purple-400 transition-colors">
                  Analysis History
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Keyword Extraction & Matching</li>
              <li>Format & Section Compliance</li>
              <li>Experience Relevance Scoring</li>
              <li>AI Improvement Suggestions</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Jankoti Ecosystem</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Job Search & Opportunities</li>
              <li>Freelance Portal</li>
              <li>Startups & Classifieds</li>
              <li>Igniting Future Ideas</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Jankoti.com. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <Link href="/" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-slate-400 transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

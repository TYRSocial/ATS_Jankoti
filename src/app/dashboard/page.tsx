'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAnalysisHistory, getCurrentUser, logoutUser } from '@/services/analysis';
import { ATSAnalysis } from '@/types/ats';
import { getScoreColor } from '@/lib/utils';
import {
  LayoutDashboard, FileSearch, History, Settings,
  LogOut, TrendingUp, Target, Award, Loader2, Plus,
  ChevronRight, BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';

function ScoreRadialMini({ score, size = 52 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const r = size * 0.38;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={size * 0.12} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color.stroke} strokeWidth={size * 0.12}
        strokeDasharray={circumference} strokeDashoffset={circumference - progress} strokeLinecap="round" />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="middle" className="rotate-90"
        style={{ fill: color.stroke, fontSize: size * 0.24, fontWeight: 900, transform: `rotate(90deg) translate(0, 0)`, transformOrigin: `${size / 2}px ${size / 2}px` }}>
        {score}
      </text>
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<ATSAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    getAnalysisHistory().then((data) => { setAnalyses(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleLogout = () => { logoutUser(); router.push('/'); };

  const avgScore = analyses.length > 0 ? Math.round(analyses.reduce((a, b) => a + b.overallScore, 0) / analyses.length) : 0;
  const best = analyses.reduce((best, a) => a.overallScore > (best?.overallScore || 0) ? a : best, analyses[0]);
  const recent = analyses.slice(0, 5);

  const SUMMARY_STATS = [
    { label: 'Total Scans', value: analyses.length, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
    { label: 'Average ATS Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50 border-fuchsia-200' },
    { label: 'Best Score', value: best ? `${best.overallScore}%` : '—', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
    { label: 'Target Roles', value: new Set(analyses.map((a) => a.jobTitle)).size, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  ];

  const NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', active: true },
    { href: '/upload', icon: FileSearch, label: 'Analyze Resume', active: false },
    { href: '/history', icon: History, label: 'Analysis History', active: false },
    { href: '/settings', icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 py-4">
      {/* Sidebar */}
      <aside className="w-full lg:w-60 flex-shrink-0">
        <div className="jankoti-card p-4 flex flex-col gap-2 sticky top-24">
          {user && (
            <div className="px-3 py-3 mb-2 border-b border-slate-200">
              <p className="text-slate-900 font-bold text-sm">{user.name}</p>
              <p className="text-slate-500 text-xs truncate">{user.email}</p>
            </div>
          )}
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                item.active
                  ? 'bg-purple-100 text-[#6d28d9] border border-purple-200'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all mt-4"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className="flex-1 min-w-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {user ? `Welcome back, ${user.name.split(' ')[0]}` : 'ATS Candidate Dashboard'}
            </h1>
            <p className="text-slate-600 text-sm mt-1">Evaluation metrics and score overview</p>
          </div>
          <Link
            href="/upload"
            className="flex items-center justify-center gap-2 px-5 py-2.5 btn-primary-gradient font-bold rounded-full text-sm shadow-md flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> <span>New Analysis</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SUMMARY_STATS.map((s) => (
            <div key={s.label} className={`jankoti-card p-5 border ${s.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-slate-500 text-xs font-semibold">{s.label}</span>
              </div>
              <div className={`text-3xl font-extrabold ${s.color}`}>{loading ? '—' : s.value}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="jankoti-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 bg-purple-50/30">
            <h2 className="text-slate-900 font-bold text-base">Recent Analyses</h2>
            <Link href="/history" className="text-sm text-purple-700 hover:underline font-bold flex items-center gap-1">
              <span>View history</span> <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-14 space-y-3">
              <BarChart3 className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-slate-900 font-bold">No analyses found yet</p>
              <p className="text-slate-500 text-sm">Upload your resume to receive your first ATS evaluation score</p>
              <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-2.5 btn-primary-gradient text-white rounded-full text-sm font-bold shadow-md">
                <Plus className="w-4 h-4" /> <span>Start Evaluation</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-purple-100">
              {recent.map((a) => {
                const col = getScoreColor(a.overallScore);
                return (
                  <Link
                    key={a.id}
                    href={`/analysis/${a.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-purple-50/40 transition-colors group"
                  >
                    <ScoreRadialMini score={a.overallScore} size={48} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-bold text-sm truncate">{a.jobTitle}</p>
                      <p className="text-slate-500 text-xs truncate">{a.resumeName} {a.targetCompany ? `· ${a.targetCompany}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${col.badgeBg}`}>
                        {a.scoreRating}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

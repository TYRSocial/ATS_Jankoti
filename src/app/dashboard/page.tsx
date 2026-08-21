'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import { getAnalysisHistory, getCurrentUser, logoutUser } from '@/services/analysis';
import { ATSAnalysis } from '@/types/ats';
import { getScoreColor } from '@/lib/utils';
import {
  LayoutDashboard, FileSearch, History, Settings,
  LogOut, TrendingUp, Target, Award, Loader2, Plus,
  ChevronRight, BarChart3, Layers
} from 'lucide-react';
import { useRouter } from 'next/navigation';

function ScoreRadialMini({ score, size = 52 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const r = size * 0.38;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#131B2E" strokeWidth={size * 0.12} />
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
    { label: 'Total Scans', value: analyses.length, icon: BarChart3, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Average ATS Score', value: `${avgScore}%`, icon: TrendingUp, color: getScoreColor(avgScore).text, bg: `${getScoreColor(avgScore).bg} ${getScoreColor(avgScore).border}` },
    { label: 'Best Score', value: best ? `${best.overallScore}%` : '—', icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Target Roles', value: new Set(analyses.map((a) => a.jobTitle)).size, icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  ];

  const NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', active: true },
    { href: '/upload', icon: FileSearch, label: 'Analyze Resume', active: false },
    { href: '/history', icon: History, label: 'Analysis History', active: false },
    { href: '/settings', icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="min-h-screen bg-[#080D1A] flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-8 gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 flex-shrink-0">
          <div className="glass-panel rounded-2xl border border-slate-800 p-4 flex flex-col gap-2 sticky top-24">
            {user && (
              <div className="px-3 py-3 mb-2 border-b border-slate-800">
                <p className="text-white font-bold text-sm">{user.name}</p>
                <p className="text-slate-500 text-xs truncate">{user.email}</p>
              </div>
            )}
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  item.active
                    ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all mt-6"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Dashboard */}
        <main className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {user ? `Welcome back, ${user.name.split(' ')[0]}` : 'ATS Candidate Dashboard'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">Here is your resume evaluation overview</p>
            </div>
            <Link
              href="/upload"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-orange-500/20 transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> New Analysis
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {SUMMARY_STATS.map((s) => (
              <div key={s.label} className={`glass-card rounded-2xl p-5 border ${s.bg}`}>
                <div className="flex items-center gap-2.5 mb-3">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-slate-400 text-xs font-semibold">{s.label}</span>
                </div>
                <div className={`text-3xl font-black ${s.color}`}>{loading ? '—' : s.value}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/40">
              <h2 className="text-white font-bold text-base">Recent Analyses</h2>
              <Link href="/history" className="text-sm text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors">
                View all history <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
              </div>
            ) : recent.length === 0 ? (
              <div className="text-center py-14">
                <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-semibold">No analyses yet</p>
                <p className="text-slate-500 text-sm mb-4">Upload your resume to receive your first ATS score</p>
                <Link href="/upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                  <Plus className="w-4 h-4" /> Start Evaluation
                </Link>
              </div>
            ) : (
              <div>
                {recent.map((a) => {
                  const col = getScoreColor(a.overallScore);
                  return (
                    <Link
                      key={a.id}
                      href={`/analysis/${a.id}`}
                      className="flex items-center gap-4 px-6 py-4 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30 transition-colors group"
                    >
                      <ScoreRadialMini score={a.overallScore} size={48} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{a.jobTitle}</p>
                        <p className="text-slate-500 text-xs truncate">{a.resumeName} {a.targetCompany ? `· ${a.targetCompany}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${col.badgeBg}`}>
                          {a.scoreRating}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

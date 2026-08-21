'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import { getAnalysisHistory, deleteAnalysis } from '@/services/analysis';
import { ATSAnalysis } from '@/types/ats';
import { getScoreColor, formatDate } from '@/lib/utils';
import {
  History, Search, Trash2, ExternalLink, FileText,
  Loader2, Plus, AlertCircle, Filter, Sparkles
} from 'lucide-react';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<ATSAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getAnalysisHistory().then((data) => {
      setAnalyses(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scan from history?')) return;
    setDeletingId(id);
    await deleteAnalysis(id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
    setDeletingId(null);
  };

  const filtered = analyses.filter((a) => {
    const matchSearch = a.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.resumeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.targetCompany || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchScore =
      scoreFilter === 'ALL' ||
      (scoreFilter === 'HIGH' && a.overallScore >= 75) ||
      (scoreFilter === 'MEDIUM' && a.overallScore >= 50 && a.overallScore < 75) ||
      (scoreFilter === 'LOW' && a.overallScore < 50);
    return matchSearch && matchScore;
  });

  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((acc, a) => acc + a.overallScore, 0) / analyses.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#080D1A]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <History className="w-7 h-7 text-orange-400" />
              Analysis History
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {analyses.length} total evaluations · Average ATS score: <span className="text-orange-400 font-bold">{avgScore}/100</span>
            </p>
          </div>
          <Link
            href="/upload"
            id="new-analysis-btn"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> New ATS Scan
          </Link>
        </div>

        {/* Summary Metrics */}
        {!loading && analyses.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Analyses', value: analyses.length, color: 'text-orange-400' },
              { label: 'Avg ATS Score', value: `${avgScore}%`, color: getScoreColor(avgScore).text },
              { label: 'High Match (≥75)', value: analyses.filter((a) => a.overallScore >= 75).length, color: 'text-emerald-400' },
              { label: 'Needs Polish (<60)', value: analyses.filter((a) => a.overallScore < 60).length, color: 'text-rose-400' },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-4 border border-slate-800 text-center">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              id="history-search"
              type="text"
              placeholder="Search by job title, resume file, or company…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-500" />
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setScoreFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  scoreFilter === f
                    ? 'bg-orange-500 border-orange-400 text-white'
                    : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f === 'HIGH' ? '≥75%' : f === 'MEDIUM' ? '50–74%' : f === 'LOW' ? '<50%' : 'All Scans'}
              </button>
            ))}
          </div>
        </div>

        {/* Scan List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl border border-slate-800">
            {analyses.length === 0 ? (
              <>
                <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg mb-2">No Past Analyses Found</h3>
                <p className="text-slate-400 text-sm mb-6">Upload your resume to begin your first evaluation.</p>
                <Link href="/upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20">
                  <Plus className="w-4 h-4" /> Start First Scan
                </Link>
              </>
            ) : (
              <>
                <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No records match your filter criteria.</p>
                <button onClick={() => { setSearchTerm(''); setScoreFilter('ALL'); }} className="mt-3 text-orange-400 hover:underline text-sm font-semibold">
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-slate-800 bg-slate-900/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">Target Job / Resume</div>
              <div className="col-span-2 hidden sm:block">Company</div>
              <div className="col-span-2 text-center">ATS Score</div>
              <div className="col-span-2 hidden lg:block">Evaluated Date</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {filtered.map((analysis) => {
              const scoreColor = getScoreColor(analysis.overallScore);
              return (
                <div
                  key={analysis.id}
                  className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-slate-800/60 hover:bg-slate-800/25 transition-colors"
                >
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{analysis.jobTitle}</p>
                        <p className="text-slate-500 text-xs truncate">{analysis.resumeName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <span className="text-slate-400 text-sm truncate block">{analysis.targetCompany || '—'}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-xl font-black ${scoreColor.text}`}>{analysis.overallScore}</span>
                    <span className="text-slate-600 text-xs">/100</span>
                    <div className={`text-[10px] font-bold uppercase mt-0.5 ${scoreColor.text}`}>{analysis.scoreRating}</div>
                  </div>
                  <div className="col-span-2 hidden lg:block">
                    <span className="text-slate-400 text-xs">{formatDate(analysis.createdAt)}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Link
                      href={`/analysis/${analysis.id}`}
                      className="p-2 text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-all"
                      title="View Report"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(analysis.id)}
                      disabled={deletingId === analysis.id}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === analysis.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

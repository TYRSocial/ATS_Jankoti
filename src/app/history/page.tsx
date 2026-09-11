'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAnalysisHistory, deleteAnalysis } from '@/services/analysis';
import { ATSAnalysis } from '@/types/ats';
import { getScoreColor, formatDate } from '@/lib/utils';
import {
  History, Search, Trash2, ExternalLink, FileText,
  Loader2, Plus, AlertCircle, Filter
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
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <History className="w-7 h-7 text-purple-600" />
            <span>Analysis History</span>
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {analyses.length} evaluations recorded · Average ATS score: <span className="text-purple-700 font-bold">{avgScore}/100</span>
          </p>
        </div>
        <Link
          href="/upload"
          id="new-analysis-btn"
          className="flex items-center gap-2 px-5 py-2.5 btn-primary-gradient font-bold rounded-full text-sm shadow-md"
        >
          <Plus className="w-4 h-4" /> <span>New ATS Scan</span>
        </Link>
      </div>

      {/* Summary Metrics */}
      {!loading && analyses.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Analyses', value: analyses.length, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
            { label: 'Avg ATS Score', value: `${avgScore}%`, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50 border-fuchsia-200' },
            { label: 'High Match (≥75)', value: analyses.filter((a) => a.overallScore >= 75).length, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
            { label: 'Needs Polish (<60)', value: analyses.filter((a) => a.overallScore < 60).length, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
          ].map((s) => (
            <div key={s.label} className={`jankoti-card p-4 border ${s.bg} text-center`}>
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-600 mt-1 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="history-search"
            type="text"
            placeholder="Search by job title, resume file, or company…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400" />
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setScoreFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                scoreFilter === f
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-purple-700'
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
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 jankoti-card p-8 space-y-3">
          {analyses.length === 0 ? (
            <>
              <History className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-slate-900 font-bold text-lg">No Past Analyses Found</h3>
              <p className="text-slate-500 text-sm">Upload your resume to begin your first evaluation.</p>
              <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-2.5 btn-primary-gradient text-white rounded-full font-bold text-sm shadow-md">
                <Plus className="w-4 h-4" /> <span>Start First Scan</span>
              </Link>
            </>
          ) : (
            <>
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-slate-600">No records match your filter criteria.</p>
              <button onClick={() => { setSearchTerm(''); setScoreFilter('ALL'); }} className="text-purple-700 hover:underline text-sm font-bold">
                Clear Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="jankoti-card overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-purple-100 bg-purple-50/40 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <div className="col-span-4">Target Job / Resume</div>
            <div className="col-span-2 hidden sm:block">Company</div>
            <div className="col-span-2 text-center">ATS Score</div>
            <div className="col-span-2 hidden lg:block">Evaluated Date</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-purple-100">
            {filtered.map((analysis) => {
              const scoreColor = getScoreColor(analysis.overallScore);
              return (
                <div
                  key={analysis.id}
                  className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-purple-50/40 transition-colors"
                >
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-purple-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-900 font-bold text-sm truncate">{analysis.jobTitle}</p>
                        <p className="text-slate-500 text-xs truncate">{analysis.resumeName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 hidden sm:block">
                    <span className="text-slate-600 text-sm truncate block font-medium">{analysis.targetCompany || '—'}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-xl font-black ${scoreColor.text}`}>{analysis.overallScore}</span>
                    <span className="text-slate-400 text-xs">/100</span>
                    <div className={`text-[10px] font-bold uppercase mt-0.5 ${scoreColor.text}`}>{analysis.scoreRating}</div>
                  </div>
                  <div className="col-span-2 hidden lg:block">
                    <span className="text-slate-500 text-xs">{formatDate(analysis.createdAt)}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Link
                      href={`/analysis/${analysis.id}`}
                      className="p-2 text-slate-500 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-all"
                      title="View Report"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(analysis.id)}
                      disabled={deletingId === analysis.id}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === analysis.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

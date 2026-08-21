'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import { getAnalysisById, updateBulletStatus } from '@/services/analysis';
import { ATSAnalysis } from '@/types/ats';
import {
  ArrowLeft, Wand2, CheckCircle, XCircle, AlertTriangle,
  ChevronRight, Loader2, Info, Sparkles
} from 'lucide-react';

export default function ImprovePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [localBullets, setLocalBullets] = useState<ATSAnalysis['bulletSuggestions']>([]);

  useEffect(() => {
    getAnalysisById(id).then((data) => {
      setAnalysis(data);
      setLocalBullets(data.bulletSuggestions);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleAction = async (bulletId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setLocalBullets((prev) =>
      prev.map((b) => (b.id === bulletId ? { ...b, status } : b))
    );
    await updateBulletStatus(id, bulletId, status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex flex-col items-center justify-center gap-4">
        <XCircle className="w-12 h-12 text-rose-400" />
        <p className="text-white text-xl font-bold">Analysis Not Found</p>
        <Link href="/history" className="text-orange-400 hover:underline">← Back to History</Link>
      </div>
    );
  }

  const accepted = localBullets.filter((b) => b.status === 'ACCEPTED').length;
  const rejected = localBullets.filter((b) => b.status === 'REJECTED').length;
  const pending = localBullets.filter((b) => !b.status || b.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#080D1A]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => router.push(`/analysis/${id}`)} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to ATS Report
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
                <Wand2 className="w-7 h-7 text-orange-400" />
                AI Resume Bullet Optimizer
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Review and integrate high-impact ATS keywords into your accomplishment statements.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="glass-card px-3.5 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-400 font-bold">
                ✓ {accepted} Accepted
              </div>
              <div className="glass-card px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-amber-400 font-bold">
                ○ {pending} Pending
              </div>
              <div className="glass-card px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-400 font-bold">
                ✕ {rejected} Rejected
              </div>
            </div>
          </div>
        </div>

        {/* Ethical Guideline Notice */}
        <div className="flex items-start gap-3 glass-card rounded-2xl p-4 border border-sky-500/30 mb-8 bg-sky-950/20">
          <Info className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300 leading-relaxed">
            <strong className="text-sky-300">Resume Integrity Notice:</strong> AI suggestions are tailored to align with the target job requirements.
            Only accept revisions that truthfully represent your authentic background and accomplishments.
          </p>
        </div>

        {localBullets.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-2xl border border-slate-800">
            <Wand2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">No Bullet Suggestions Available</h3>
            <p className="text-slate-400 text-sm mb-4">Run a new scan with a detailed job description to generate suggestions.</p>
            <Link href="/upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20">
              Analyze New Resume <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {localBullets.map((bullet) => (
              <div
                key={bullet.id}
                className={`glass-card rounded-2xl border overflow-hidden transition-all ${
                  bullet.status === 'ACCEPTED'
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : bullet.status === 'REJECTED'
                    ? 'border-slate-800 opacity-60'
                    : 'border-slate-800'
                }`}
              >
                {/* Status Bar */}
                <div className="px-6 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">SECTION:</span>
                    <span className="text-xs text-orange-400 font-bold">{bullet.section}</span>
                  </div>
                  <div>
                    {bullet.status === 'ACCEPTED' && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle className="w-3.5 h-3.5" /> Accepted
                      </span>
                    )}
                    {bullet.status === 'REJECTED' && (
                      <span className="flex items-center gap-1 text-xs text-slate-400 font-bold bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                    {(!bullet.status || bullet.status === 'PENDING') && (
                      <span className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        <AlertTriangle className="w-3.5 h-3.5" /> Pending Review
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* Side by side comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Original Resume Statement</p>
                      <div className="bg-[#050811] rounded-xl p-4 border border-slate-800 text-sm text-slate-300 leading-relaxed min-h-[90px]">
                        {bullet.original}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                        AI-Optimized Bullet Point
                      </p>
                      <div className="bg-orange-950/15 rounded-xl p-4 border border-orange-500/30 text-sm text-slate-100 leading-relaxed min-h-[90px] font-medium">
                        {bullet.suggested}
                      </div>
                    </div>
                  </div>

                  {/* Rationale */}
                  <div className="flex items-start gap-2 bg-slate-900/60 rounded-xl px-4 py-3 mb-5 border border-slate-800">
                    <Info className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong className="text-slate-200">AI Rationale: </strong>
                      {bullet.explanation}
                    </p>
                  </div>

                  {/* Actions */}
                  {(!bullet.status || bullet.status === 'PENDING') && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAction(bullet.id, 'ACCEPTED')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle className="w-4 h-4" /> Accept Revision
                      </button>
                      <button
                        onClick={() => handleAction(bullet.id, 'REJECTED')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all border border-slate-700"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}

                  {(bullet.status === 'ACCEPTED' || bullet.status === 'REJECTED') && (
                    <button
                      onClick={() => handleAction(bullet.id, 'PENDING' as any)}
                      className="text-xs text-slate-400 hover:text-orange-400 underline transition-colors"
                    >
                      Undo decision
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

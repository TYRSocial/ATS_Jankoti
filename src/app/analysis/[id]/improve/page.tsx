'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
        <XCircle className="w-12 h-12 text-rose-500" />
        <p className="text-slate-900 text-xl font-bold">Analysis Report Not Found</p>
        <Link href="/history" className="text-purple-700 hover:underline font-bold text-sm">← Back to History</Link>
      </div>
    );
  }

  const accepted = localBullets.filter((b) => b.status === 'ACCEPTED').length;
  const rejected = localBullets.filter((b) => b.status === 'REJECTED').length;
  const pending = localBullets.filter((b) => !b.status || b.status === 'PENDING').length;

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div>
        <button onClick={() => router.push(`/analysis/${id}`)} className="flex items-center gap-1.5 text-slate-600 hover:text-purple-700 text-sm mb-3 font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to ATS Report
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Wand2 className="w-7 h-7 text-purple-600" />
              <span>AI Resume Bullet Optimizer</span>
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Review and integrate high-impact ATS keywords into your accomplishment statements.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="jankoti-card px-3.5 py-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 font-bold">
              ✓ {accepted} Accepted
            </div>
            <div className="jankoti-card px-3.5 py-1.5 border-amber-200 bg-amber-50 text-amber-700 font-bold">
              ○ {pending} Pending
            </div>
            <div className="jankoti-card px-3.5 py-1.5 border-slate-200 text-slate-500 font-bold">
              ✕ {rejected} Rejected
            </div>
          </div>
        </div>
      </div>

      {/* Ethical Guideline Notice */}
      <div className="flex items-start gap-3 jankoti-card p-4 border-purple-200 bg-purple-50/50">
        <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700 leading-relaxed">
          <strong className="text-purple-900">Resume Integrity Notice:</strong> AI suggestions are tailored to align with the target job requirements.
          Only accept revisions that truthfully represent your authentic background and accomplishments.
        </p>
      </div>

      {localBullets.length === 0 ? (
        <div className="text-center py-16 jankoti-card p-8 space-y-3">
          <Wand2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-slate-900 font-bold text-lg">No Bullet Suggestions Available</h3>
          <p className="text-slate-500 text-sm">Run a new scan with a detailed job description to generate suggestions.</p>
          <Link href="/upload" className="inline-flex items-center gap-2 px-6 py-2.5 btn-primary-gradient text-white rounded-full text-sm font-bold shadow-md">
            <span>Analyze New Resume</span> <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {localBullets.map((bullet) => (
            <div
              key={bullet.id}
              className={`jankoti-card overflow-hidden transition-all ${
                bullet.status === 'ACCEPTED'
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : bullet.status === 'REJECTED'
                  ? 'border-slate-200 opacity-60'
                  : 'border-purple-100'
              }`}
            >
              {/* Status Bar */}
              <div className="px-6 py-3 flex items-center justify-between border-b border-purple-100 bg-purple-50/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">SECTION:</span>
                  <span className="text-xs text-purple-700 font-extrabold">{bullet.section}</span>
                </div>
                <div>
                  {bullet.status === 'ACCEPTED' && (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" /> Accepted
                    </span>
                  )}
                  {bullet.status === 'REJECTED' && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      <XCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}
                  {(!bullet.status || bullet.status === 'PENDING') && (
                    <span className="flex items-center gap-1 text-xs text-amber-700 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" /> Pending Review
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Side by side comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Original Resume Statement</p>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm text-slate-700 leading-relaxed min-h-[90px]">
                      {bullet.original}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      AI-Optimized Bullet Point
                    </p>
                    <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-200 text-sm text-slate-900 leading-relaxed min-h-[90px] font-semibold">
                      {bullet.suggested}
                    </div>
                  </div>
                </div>

                {/* Rationale */}
                <div className="flex items-start gap-2 bg-slate-50 rounded-xl px-4 py-3 mb-5 border border-slate-200">
                  <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">AI Rationale: </strong>
                    {bullet.explanation}
                  </p>
                </div>

                {/* Actions */}
                {(!bullet.status || bullet.status === 'PENDING') && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAction(bullet.id, 'ACCEPTED')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-bold transition-all shadow-md"
                    >
                      <CheckCircle className="w-4 h-4" /> Accept Revision
                    </button>
                    <button
                      onClick={() => handleAction(bullet.id, 'REJECTED')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-full text-sm font-bold transition-all border border-slate-300"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}

                {(bullet.status === 'ACCEPTED' || bullet.status === 'REJECTED') && (
                  <button
                    onClick={() => handleAction(bullet.id, 'PENDING' as any)}
                    className="text-xs text-purple-700 hover:underline font-bold transition-colors"
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
  );
}

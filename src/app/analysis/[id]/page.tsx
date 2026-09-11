'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAnalysisById } from '@/services/analysis';
import { ATSAnalysis } from '@/types/ats';
import { getScoreColor, formatDate, getImpactBadge } from '@/lib/utils';
import {
  ArrowLeft, ExternalLink, CheckCircle, XCircle,
  AlertTriangle, ChevronDown, ChevronUp, Loader2,
  Target, Lightbulb, Wand2, BarChart3, FileText
} from 'lucide-react';

function ATSScoreGauge({ score }: { score: number }) {
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color.stroke} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-black ${color.text}`}>{score}</span>
          <span className="text-slate-400 text-xs font-semibold">/ 100</span>
        </div>
      </div>
      <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${color.badgeBg}`}>
        {score >= 80 ? 'Excellent Match' : score >= 65 ? 'Good Match' : score >= 50 ? 'Needs Improvement' : 'Low Match'}
      </span>
    </div>
  );
}

function CategoryBar({ label, score }: { label: string; score: number }) {
  const color = getScoreColor(score);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className={`text-sm font-extrabold ${color.text}`}>{score}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color.stroke }}
        />
      </div>
    </div>
  );
}

function KeywordBadge({ word, status }: { word: string; status: 'MATCHED' | 'MISSING' | 'PARTIAL' }) {
  const styles = {
    MATCHED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    MISSING: 'bg-rose-50 text-rose-700 border border-rose-200',
    PARTIAL: 'bg-amber-50 text-amber-700 border border-amber-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles[status]}`}>
      {status === 'MATCHED' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
      {status === 'MISSING' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
      {status === 'PARTIAL' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
      {word}
    </span>
  );
}

function SectionAuditCard({ section }: { section: ATSAnalysis['sectionAudits'][0] }) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = {
    PASSED: { icon: CheckCircle, color: 'text-emerald-700', bg: 'border-emerald-200 bg-emerald-50/30' },
    WARNING: { icon: AlertTriangle, color: 'text-amber-700', bg: 'border-amber-200 bg-amber-50/30' },
    FAILED: { icon: XCircle, color: 'text-rose-700', bg: 'border-rose-200 bg-rose-50/30' },
  };
  const cfg = statusConfig[section.status];

  return (
    <div className={`jankoti-card border ${cfg.bg} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <cfg.icon className={`w-4 h-4 ${cfg.color} flex-shrink-0`} />
          <span className="text-slate-900 font-bold text-sm">{section.name}</span>
          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${cfg.color} bg-white border border-slate-200`}>
            {section.score}/100
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-200 pt-3 space-y-3 bg-white">
          {section.issues.length > 0 && (
            <div>
              <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">Detected Issues</p>
              {section.issues.map((issue, i) => (
                <p key={i} className="text-sm text-slate-700 flex gap-2 mb-1.5"><XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />{issue}</p>
              ))}
            </div>
          )}
          {section.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Recommendations</p>
              {section.suggestions.map((s, i) => (
                <p key={i} className="text-sm text-slate-700 flex gap-2 mb-1.5"><Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />{s}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'skills' | 'sections' | 'recommendations'>('overview');
  const [keywordFilter, setKeywordFilter] = useState<'ALL' | 'MATCHED' | 'MISSING' | 'PARTIAL'>('ALL');

  useEffect(() => {
    getAnalysisById(id).then((data) => {
      setAnalysis(data);
      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="py-20 flex items-center justify-center flex-col gap-4 text-center">
        <XCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold text-slate-900">Analysis Report Not Found</h2>
        <Link href="/history" className="text-purple-700 hover:underline font-bold text-sm">← Back to History</Link>
      </div>
    );
  }

  const allKeywords = analysis.keywordDetails.filter(
    (k) => keywordFilter === 'ALL' || k.status === keywordFilter
  );

  const CATEGORY_LABELS = [
    { key: 'keywordScore', label: 'Keyword Match' },
    { key: 'skillScore', label: 'Skills Match' },
    { key: 'experienceScore', label: 'Experience Match' },
    { key: 'educationScore', label: 'Education Match' },
    { key: 'formattingScore', label: 'Resume Formatting' },
    { key: 'structureScore', label: 'Resume Structure' },
  ] as const;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'keywords', label: 'Keywords', icon: Target },
    { id: 'skills', label: 'Skills Matrix', icon: CheckCircle },
    { id: 'sections', label: 'Section Audit', icon: AlertTriangle },
    { id: 'recommendations', label: 'AI Suggestions', icon: Lightbulb },
  ] as const;

  return (
    <div className="space-y-8 py-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button onClick={() => router.push('/history')} className="flex items-center gap-1.5 text-slate-600 hover:text-purple-700 text-sm mb-2 font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to History
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{analysis.jobTitle}</h1>
          </div>
          {analysis.targetCompany && <p className="text-purple-700 font-bold text-sm mt-0.5">{analysis.targetCompany}</p>}
          <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-2 font-medium">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            {analysis.resumeName} • Evaluated {formatDate(analysis.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/analysis/${id}/improve`}
            id="btn-ai-optimizer"
            className="flex items-center gap-2 px-5 py-2.5 btn-primary-gradient text-white rounded-full text-sm font-bold shadow-md"
          >
            <Wand2 className="w-4 h-4" /> <span>AI Bullet Optimizer</span>
          </Link>
        </div>
      </div>

      {/* ATS Score Overview Card */}
      <div className="jankoti-card p-6 sm:p-8 bg-white">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <ATSScoreGauge score={analysis.overallScore} />
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Category Score Breakdown</h2>
              <span className="text-xs text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full font-bold">6 Pillars</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CATEGORY_LABELS.map(({ key, label }) => (
                <CategoryBar key={key} label={label} score={analysis.categoryScores[key]} />
              ))}
            </div>
          </div>
          <div className="flex lg:flex-col gap-3 w-full lg:w-44 flex-shrink-0">
            {[
              { label: 'Matched Terms', val: analysis.matchedKeywords.length, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
              { label: 'Missing Terms', val: analysis.missingKeywords.length, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
              { label: 'Partial Matches', val: analysis.partialKeywords.length, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
            ].map((stat) => (
              <div key={stat.label} className={`flex-1 jankoti-card p-3 border ${stat.bg} text-center`}>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.val}</div>
                <div className="text-[11px] text-slate-600 mt-0.5 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-full border border-slate-300 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-white text-purple-700 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="jankoti-card p-6">
            <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2 text-base">
              <CheckCircle className="w-5 h-5 text-emerald-600" /> Detected Keywords in Resume
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.matchedKeywords.map((w) => <KeywordBadge key={w} word={w} status="MATCHED" />)}
            </div>
          </div>
          <div className="jankoti-card p-6">
            <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2 text-base">
              <XCircle className="w-5 h-5 text-rose-600" /> Missing Keywords from Job Description
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords.length > 0
                ? analysis.missingKeywords.map((w) => <KeywordBadge key={w} word={w} status="MISSING" />)
                : <p className="text-slate-500 text-sm">No missing keywords found! Exceptional keyword coverage.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Keywords */}
      {activeTab === 'keywords' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {(['ALL', 'MATCHED', 'MISSING', 'PARTIAL'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setKeywordFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  keywordFilter === f
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-purple-700'
                }`}
              >
                {f} {f === 'ALL' ? `(${analysis.keywordDetails.length})` : f === 'MATCHED' ? `(${analysis.matchedKeywords.length})` : f === 'MISSING' ? `(${analysis.missingKeywords.length})` : `(${analysis.partialKeywords.length})`}
              </button>
            ))}
          </div>
          <div className="jankoti-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-purple-100 bg-purple-50/40">
                  <th className="text-left px-5 py-3.5 text-slate-700 font-bold text-xs uppercase tracking-wider">Keyword</th>
                  <th className="text-left px-5 py-3.5 text-slate-700 font-bold text-xs uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="text-center px-5 py-3.5 text-slate-700 font-bold text-xs uppercase tracking-wider hidden md:table-cell">In Resume</th>
                  <th className="text-center px-5 py-3.5 text-slate-700 font-bold text-xs uppercase tracking-wider hidden md:table-cell">In JD</th>
                  <th className="text-center px-5 py-3.5 text-slate-700 font-bold text-xs uppercase tracking-wider">Match Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {allKeywords.map((kw) => (
                  <tr key={kw.word} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-5 py-3.5 text-slate-900 font-bold">{kw.word}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-medium hidden sm:table-cell">{kw.category}</td>
                    <td className="px-5 py-3.5 text-center text-slate-700 font-mono hidden md:table-cell font-bold">{kw.countInResume}</td>
                    <td className="px-5 py-3.5 text-center text-slate-700 font-mono hidden md:table-cell font-bold">{kw.countInJD}</td>
                    <td className="px-5 py-3.5 text-center">
                      <KeywordBadge word={kw.status} status={kw.status} />
                    </td>
                  </tr>
                ))}
                {allKeywords.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-500">No keywords match this filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Skills */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analysis.skillComparison.map((cat) => {
            const pct = Math.round((cat.matchedCount / Math.max(1, cat.requiredCount)) * 100);
            const col = getScoreColor(pct);
            return (
              <div key={cat.category} className="jankoti-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-900 font-bold text-base">{cat.category}</h3>
                  <span className={`text-xl font-black ${col.text}`}>{pct}%</span>
                </div>
                <div className="flex gap-2 text-center p-3 rounded-xl bg-purple-50/50 border border-purple-100">
                  {[{ l: 'Required', v: cat.requiredCount, c: 'text-slate-700' }, { l: 'Matched', v: cat.matchedCount, c: 'text-emerald-700' }, { l: 'Missing', v: cat.missingCount, c: 'text-rose-700' }].map((s) => (
                    <div key={s.l} className="flex-1">
                      <div className={`text-xl font-extrabold ${s.c}`}>{s.v}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">{s.l}</div>
                    </div>
                  ))}
                </div>
                {cat.matchedSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Matched</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.matchedSkills.map((s) => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {cat.missingSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">Missing from Resume</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.missingSkills.map((s) => (
                        <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Section Audits */}
      {activeTab === 'sections' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {analysis.sectionAudits.map((section) => (
            <SectionAuditCard key={section.name} section={section} />
          ))}
        </div>
      )}

      {/* Tab 5: Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-slate-600 text-sm font-bold">{analysis.recommendations.length} Actionable AI Recommendations</p>
            <Link
              href={`/analysis/${id}/improve`}
              className="flex items-center gap-1.5 text-sm text-purple-700 hover:underline font-extrabold"
            >
              <Wand2 className="w-4 h-4" /> <span>Open AI Bullet Optimizer</span> <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          {analysis.recommendations.map((rec) => (
            <div key={rec.id} className="jankoti-card p-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-slate-900 font-bold text-base">{rec.problem}</h4>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${getImpactBadge(rec.impact)}`}>
                  {rec.impact} IMPACT
                </span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">{rec.recommendation}</p>
              <span className="inline-block text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Target Section: {rec.section}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

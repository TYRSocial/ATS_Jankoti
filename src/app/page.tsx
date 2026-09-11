import Link from 'next/link';
import {
  ArrowRight, Sparkles, Target, Zap, Shield, TrendingUp,
  ChevronRight, FileText, Brain, BarChart3, Award, Check, CheckCircle
} from 'lucide-react';

const FEATURES = [
  {
    icon: Target,
    title: 'ATS Score Analysis',
    description: 'Get an instant compatibility score showing exactly how well your resume matches the job requirements.',
    color: 'text-purple-600',
    bg: 'bg-purple-50 border-purple-200',
  },
  {
    icon: Brain,
    title: 'AI Keyword Matching',
    description: 'Identifies matched, partial, and missing keywords across technical skills, tools, and domain expertise.',
    color: 'text-fuchsia-600',
    bg: 'bg-fuchsia-50 border-fuchsia-200',
  },
  {
    icon: BarChart3,
    title: 'Skill Gap Matrix',
    description: 'Visualize exactly which skills you have vs what the employer needs across technical, tools, and soft skills.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  {
    icon: TrendingUp,
    title: 'Resume Section Audits',
    description: 'Individual scoring and actionable guidance for Summary, Experience, Skills, Education, and Projects.',
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
  },
  {
    icon: Zap,
    title: 'AI Bullet Optimizer',
    description: 'Get AI-rewritten bullet points that weave in missing keywords while preserving your authentic experience.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-200',
  },
  {
    icon: Shield,
    title: 'Formatting & Layout Guard',
    description: 'Detect ATS-breaking issues like multi-columns, complex tables, graphics, and unparseable layouts.',
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
  },
];

const HOW_IT_WORKS = [
  { step: '01', icon: FileText, title: 'Upload Resume', desc: 'Upload your resume in PDF or DOCX format. We securely parse all text content.' },
  { step: '02', icon: Target, title: 'Paste Job Description', desc: 'Paste the target job description from LinkedIn, Indeed, Naukri, or company portals.' },
  { step: '03', icon: Brain, title: 'AI ATS Evaluation', desc: 'Our engine scans keyword density, skill compatibility, structure, and format across 6 pillars.' },
  { step: '04', icon: Award, title: 'Actionable Report', desc: 'Receive your overall ATS score, category breakdown, missing keywords, and AI suggestions.' },
];

const STATS = [
  { value: '98.4%', label: 'ATS Parsing Accuracy' },
  { value: '6 Pillar', label: 'Score Breakdown' },
  { value: '50k+', label: 'Resumes Optimized' },
  { value: '< 30s', label: 'Turnaround Time' },
];

export default function HomePage() {
  return (
    <div className="space-y-20 pb-16 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 text-center">
        <div className="max-w-4xl mx-auto space-y-6 px-4">
          {/* Jankoti Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/90 border border-purple-200 text-[#6d28d9] text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-purple-600" />
            Jankoti AI Resume Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Optimize for the ATS.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#d946ef]">
              Land More Interviews.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Instantly benchmark your resume against any job description. Uncover missing keywords,
            identify skill gaps, resolve formatting issues, and rewrite bullets with AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/upload"
              id="hero-cta-primary"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold rounded-full shadow-lg hover:shadow-purple-200 transition-all text-base"
            >
              <Sparkles className="w-5 h-5" />
              <span>Analyze My Resume — Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/history"
              id="hero-cta-secondary"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 border border-purple-200 text-slate-700 hover:text-purple-700 font-semibold rounded-full transition-all shadow-sm text-base"
            >
              <span>View Past Reports</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 px-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center"
              >
                <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#6d28d9] to-[#d946ef]">
                  {s.value}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Preview Diagnostic Card */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-purple-500/5 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-widest bg-purple-100 px-3 py-1 rounded-full">
                REAL-TIME ATS DIAGNOSTICS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                Understand exactly how hiring algorithms rank your profile
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Most resumes get filtered out by Applicant Tracking Systems before reaching a recruiter.
                Jankoti ATS Checker decodes scoring criteria so your application gets noticed.
              </p>
              <div className="space-y-2.5 pt-2">
                {['Direct keyword frequency comparison', 'Technical vs Soft skill matching', 'AI suggestions with 1-click bullet improvements'].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Mini Diagnostic Preview */}
            <div className="lg:col-span-7 bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-white font-bold text-base">Senior Full Stack Engineer</h3>
                  <p className="text-xs text-slate-400">TechCorp · Analyzed with Jankoti ATS Engine</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">82<span className="text-xs text-slate-500 font-normal">/100</span></div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">EXCELLENT MATCH</span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-3 mb-4">
                {[
                  { label: 'Keyword Match', score: 85, color: 'bg-emerald-400' },
                  { label: 'Skills Match', score: 80, color: 'bg-purple-400' },
                  { label: 'Experience Match', score: 90, color: 'bg-fuchsia-400' },
                  { label: 'Formatting Quality', score: 75, color: 'bg-amber-400' },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{bar.label}</span>
                      <span className="text-white font-bold">{bar.score}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skill Badges preview */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">✓ React</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">✓ Node.js</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">✓ TypeScript</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">✕ AWS (Missing)</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">✕ Docker (Missing)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-widest bg-purple-100 px-3 py-1 rounded-full">
            COMPLETE ATS AUDIT
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Comprehensive 6-Pillar Analysis</h2>
          <p className="text-slate-600 mt-2 text-sm">Everything you need to beat automated resume screeners and impress hiring managers.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${feat.bg}`}>
                  <Icon className={`w-6 h-6 ${feat.color}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center">
          <div className="mb-10">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-widest bg-purple-100 px-3 py-1 rounded-full">
              SIMPLE WORKFLOW
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">How Jankoti ATS Works</h2>
            <p className="text-slate-600 text-sm mt-1">4 simple steps to a competitive ATS score</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left relative">
                  <div className="text-purple-600 font-black text-xs tracking-widest mb-3">STEP {item.step}</div>
                  <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-purple-700" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-base mb-1">{item.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-10 sm:p-12 text-center shadow-2xl relative overflow-hidden border border-purple-500/20">
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to test your resume?</h2>
            <p className="text-purple-200 text-base max-w-xl mx-auto">
              Free, instant analysis. No credit card required. Benchmarked against modern Applicant Tracking Systems.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/upload"
                id="cta-bottom-primary"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 text-white font-bold rounded-full shadow-lg transition-all text-base"
              >
                <Sparkles className="w-5 h-5" />
                <span>Get Free ATS Score</span>
              </Link>
              <Link
                href="/history"
                id="cta-bottom-history"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full transition-all text-base"
              >
                <span>Analysis History</span>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 pt-4 text-xs text-purple-300">
              {['No credit card required', 'Instant evaluation', 'PDF & DOCX supported'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


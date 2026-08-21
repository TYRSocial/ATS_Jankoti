import Link from 'next/link';
import { Navbar } from '@/components/navigation/Navbar';
import {
  ArrowRight, Sparkles, Target, Zap, Shield, TrendingUp,
  CheckCircle, ChevronRight, FileText, Brain, BarChart3, Award,
  Layers, Check
} from 'lucide-react';

const FEATURES = [
  {
    icon: Target,
    title: 'ATS Score Analysis',
    description: 'Get an instant compatibility score showing exactly how well your resume matches the job requirements.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    icon: Brain,
    title: 'AI Keyword Matching',
    description: 'Identifies matched, partial, and missing keywords across technical skills, tools, and domain expertise.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: BarChart3,
    title: 'Skill Gap Matrix',
    description: 'Visualize exactly which skills you have vs what the employer needs across technical, tools, and soft skills.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Resume Section Audits',
    description: 'Individual scoring and actionable guidance for Summary, Experience, Skills, Education, and Projects.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Zap,
    title: 'AI Bullet Optimizer',
    description: 'Get AI-rewritten bullet points that weave in missing keywords while preserving your authentic experience.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
  },
  {
    icon: Shield,
    title: 'Formatting & Layout Guard',
    description: 'Detect ATS-breaking issues like multi-columns, complex tables, graphics, and unparseable layouts.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
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
  { value: '6', label: 'Score Categories' },
  { value: '50k+', label: 'Resumes Analyzed' },
  { value: '< 30s', label: 'Analysis Turnaround' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080D1A] overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-24 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-[400px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-sm font-medium mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-orange-400" />
            Jankoti AI Resume Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Optimize for the ATS.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-indigo-300">
              Land the Interview.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Instantly benchmark your resume against any job description. Uncover missing keywords,
            identify skill gaps, resolve formatting issues, and rewrite bullets with AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/upload"
              id="hero-cta-primary"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.03] active:scale-[0.97] text-base"
            >
              <Sparkles className="w-5 h-5" />
              Analyze My Resume — Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/history"
              id="hero-cta-secondary"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-medium rounded-xl transition-all text-base"
            >
              View Sample Results
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="glass-card rounded-xl px-4 py-4 text-center border border-slate-800"
              >
                <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                  {s.value}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Preview / Feature Card */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto glass-panel rounded-3xl p-6 sm:p-10 border border-slate-700/70 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">REAL-TIME ATS DIAGNOSTICS</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Understand exactly how hiring algorithms rank your profile</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Most resumes get rejected by Applicant Tracking Systems before a human ever reads them.
                Jankoti ATS Checker decodes the ranking criteria so you stand out on every submission.
              </p>
              <div className="space-y-2 pt-2">
                {['Direct keyword frequency comparison', 'Technical vs Soft skill matching', 'AI suggestions with 1-click accept'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Mini Mock */}
            <div className="lg:col-span-7 bg-[#060913] rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <h3 className="text-white font-bold text-base">Senior Full Stack Engineer</h3>
                  <p className="text-xs text-slate-500">TechCorp · Analyzed with Jankoti ATS Engine</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">82<span className="text-xs text-slate-500 font-normal">/100</span></div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">EXCELLENT</span>
                </div>
              </div>

              {/* Progress bars */}
              <div className="space-y-2.5 mb-4">
                {[
                  { label: 'Keyword Match', score: 85, color: 'bg-emerald-400' },
                  { label: 'Skills Match', score: 80, color: 'bg-orange-400' },
                  { label: 'Experience Match', score: 90, color: 'bg-indigo-400' },
                  { label: 'Formatting Quality', score: 75, color: 'bg-amber-400' },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{bar.label}</span>
                      <span className="text-slate-200 font-bold">{bar.score}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Badges preview */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">✓ React</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">✓ Node.js</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">✓ TypeScript</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">✕ AWS (Missing)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">✕ Kubernetes (Missing)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to beat the ATS
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A comprehensive toolkit engineered to maximize your application conversion rate.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`glass-card glass-card-hover rounded-2xl p-6 border ${f.bg}`}
              >
                <div className={`w-11 h-11 rounded-xl ${f.bg} border flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How it works</h2>
            <p className="text-slate-400 text-lg">4 simple steps to a competitive ATS score</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="relative">
                <div className="glass-card rounded-2xl p-6 border border-slate-800 h-full">
                  <div className="text-orange-500 font-black text-xs tracking-widest mb-4">STEP {item.step}</div>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/60">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-panel rounded-3xl p-10 border border-orange-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-indigo-600/5 to-transparent pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to test your resume?</h2>
              <p className="text-slate-400 mb-8 text-lg">
                Free, instant analysis. No credit card or complex setup needed.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/upload"
                  id="cta-bottom-primary"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-orange-500/20"
                >
                  <Sparkles className="w-5 h-5" />
                  Get Free ATS Score
                </Link>
                <Link
                  href="/history"
                  id="cta-bottom-history"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 font-medium rounded-xl transition-all"
                >
                  View Sample Analyses
                </Link>
              </div>
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-slate-500">
                {['No credit card required', 'Instant evaluation', 'PDF & DOCX supported'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-orange-500 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold">Jankoti</span>
              <span className="text-orange-400 font-bold ml-1">ATS</span>
            </div>
          </div>
          <p className="text-slate-500 text-sm text-center">
            © 2026 Jankoti. Igniting Future Ideas. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <Link href="/upload" className="hover:text-orange-400 transition-colors">Analyze</Link>
            <Link href="/dashboard" className="hover:text-orange-400 transition-colors">Dashboard</Link>
            <Link href="/history" className="hover:text-orange-400 transition-colors">History</Link>
            <Link href="/settings" className="hover:text-orange-400 transition-colors">Settings</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

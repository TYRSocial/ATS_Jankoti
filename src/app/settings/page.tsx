'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navigation/Navbar';
import { Settings, Server, Save, CheckCircle, AlertCircle, Database, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('ats_api_url') || '';
    return '';
  });
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      if (apiUrl.trim()) {
        localStorage.setItem('ats_api_url', apiUrl.trim());
      } else {
        localStorage.removeItem('ats_api_url');
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const url = apiUrl.trim() || '';
      const res = await fetch(`${url}/api/analysis/history`);
      setTestResult(res.ok ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080D1A]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 mb-8">
          <Settings className="w-7 h-7 text-orange-400" /> System Settings & DB Config
        </h1>

        {/* MongoDB Config */}
        <section className="glass-panel rounded-3xl border border-slate-800 p-7 mb-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">MongoDB Database Persistence</h2>
              <p className="text-slate-400 text-xs">Mongoose model integration & automated schema storage</p>
            </div>
          </div>
          <div className="bg-[#050811] rounded-2xl p-4 border border-slate-800 font-mono text-sm mb-3">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Active URI (.env.local):</p>
            <p className="text-emerald-400 font-semibold">mongodb://localhost:27017/ats-checker</p>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Configure your MongoDB connection string in <code className="text-orange-400 font-mono">.env.local</code>.
            If MongoDB is offline, the app automatically switches to deterministic local state caching with zero interruptions.
          </p>
        </section>

        {/* External API Integration */}
        <section className="glass-panel rounded-3xl border border-slate-800 p-7 mb-6 shadow-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Backend API Server</h2>
              <p className="text-slate-400 text-xs">Connect to Recruitment-X Express server (optional)</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="api-url">
                Custom API Base URL
              </label>
              <input
                id="api-url"
                type="text"
                placeholder="http://localhost:5000/api (Leave blank for internal Next.js API)"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition-all text-sm font-mono"
              />
              <p className="text-slate-500 text-xs mt-2">
                Default: Uses built-in Next.js route handlers backed by MongoDB.
              </p>
            </div>

            {testResult && (
              <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${testResult === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
                {testResult === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {testResult === 'success' ? 'API connection healthy & responding!' : 'Could not reach specified endpoint. Verify server is running.'}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                id="test-api-btn"
                onClick={handleTest}
                disabled={testing}
                className="px-4 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              >
                {testing ? 'Testing…' : 'Test Endpoint'}
              </button>
              <button
                id="save-settings-btn"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-orange-500/20"
              >
                {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
              </button>
            </div>
          </div>
        </section>

        {/* API Route Reference */}
        <section className="glass-card rounded-3xl border border-slate-800 p-7">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-white font-bold text-base">Registered API Handlers</h2>
          </div>
          <div className="space-y-2 font-mono text-xs">
            {[
              { method: 'POST', path: '/api/analysis', desc: 'Run new ATS scan and persist in MongoDB' },
              { method: 'GET', path: '/api/analysis/history', desc: 'Retrieve full list of previous candidate scans' },
              { method: 'GET', path: '/api/analysis/:id', desc: 'Fetch detailed ATS scorecard by ID' },
              { method: 'PATCH', path: '/api/analysis/:id', desc: 'Update AI bullet suggestion status' },
              { method: 'DELETE', path: '/api/analysis/:id', desc: 'Remove analysis record from MongoDB' },
              { method: 'POST', path: '/api/resume/upload', desc: 'Upload and validate resume file format' },
              { method: 'POST', path: '/api/auth/register', desc: 'Create user profile' },
              { method: 'POST', path: '/api/auth/login', desc: 'Authenticate user' },
            ].map((ep) => (
              <div key={ep.path} className="flex items-start gap-3 py-1.5 border-b border-slate-800/40 last:border-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 mt-0.5 ${ep.method === 'GET' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : ep.method === 'POST' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : ep.method === 'DELETE' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                  {ep.method}
                </span>
                <div>
                  <span className="text-slate-200 font-semibold">{ep.path}</span>
                  <p className="text-slate-500 text-[11px] font-sans mt-0.5">{ep.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

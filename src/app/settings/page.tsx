'use client';

import { useState, useEffect } from 'react';
import { Settings, Server, Save, CheckCircle, AlertCircle, Database, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('ats_api_url');
      if (savedUrl) setApiUrl(savedUrl);
    }
  }, []);

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
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
        <Settings className="w-7 h-7 text-purple-600" />
        <span>System Settings & DB Config</span>
      </h1>

      {/* MongoDB Config */}
      <section className="jankoti-card p-7 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-slate-900 font-bold text-base">MongoDB Database Persistence</h2>
            <p className="text-slate-500 text-xs">Mongoose model integration & automated schema storage</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 font-mono text-xs">
          <p className="text-slate-500 font-bold uppercase tracking-wider mb-1">Active URI (.env.local):</p>
          <p className="text-emerald-700 font-bold">mongodb://localhost:27017/ats-checker</p>
        </div>
        <p className="text-slate-600 text-xs leading-relaxed">
          Configure your MongoDB connection string in <code className="text-purple-700 font-bold font-mono">.env.local</code>.
          If MongoDB is offline, the app automatically switches to deterministic local state caching with zero interruptions.
        </p>
      </section>

      {/* External API Integration */}
      <section className="jankoti-card p-7 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center">
            <Server className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h2 className="text-slate-900 font-bold text-base">Backend API Server</h2>
            <p className="text-slate-500 text-xs">Connect to external backend endpoint (optional)</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="api-url">
              Custom API Base URL
            </label>
            <input
              id="api-url"
              type="text"
              placeholder="http://localhost:5000/api (Leave blank for internal Next.js API)"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-xs font-mono"
            />
            <p className="text-slate-500 text-xs mt-1.5">
              Default: Uses built-in Next.js route handlers backed by MongoDB.
            </p>
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 text-xs font-bold px-4 py-3 rounded-xl ${testResult === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
              {testResult === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {testResult === 'success' ? 'API connection healthy & responding!' : 'Could not reach specified endpoint. Verify server is running.'}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              id="test-api-btn"
              onClick={handleTest}
              disabled={testing}
              className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-full text-xs font-bold transition-all disabled:opacity-50"
            >
              {testing ? 'Testing…' : 'Test Endpoint'}
            </button>
            <button
              id="save-settings-btn"
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 btn-primary-gradient text-white rounded-full text-xs font-bold shadow-md"
            >
              {saved ? <><CheckCircle className="w-4 h-4" /> <span>Saved!</span></> : <><Save className="w-4 h-4" /> <span>Save Settings</span></>}
            </button>
          </div>
        </div>
      </section>

      {/* API Route Reference */}
      <section className="jankoti-card p-7 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-700" />
          <h2 className="text-slate-900 font-bold text-base">Registered API Handlers</h2>
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
            <div key={ep.path} className="flex items-start gap-3 py-2 border-b border-purple-100 last:border-0">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded flex-shrink-0 mt-0.5 ${ep.method === 'GET' ? 'bg-sky-100 text-sky-700 border border-sky-200' : ep.method === 'POST' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : ep.method === 'DELETE' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                {ep.method}
              </span>
              <div>
                <span className="text-slate-900 font-bold">{ep.path}</span>
                <p className="text-slate-500 text-[11px] font-sans mt-0.5 font-medium">{ep.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

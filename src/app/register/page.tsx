'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/services/analysis';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const PERKS = [
    'Save and organize all your ATS scans',
    'Track scoring progress across job applications',
    'Generate AI bullet optimizations',
    'Export comprehensive candidate evaluation reports',
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) { setError('Name and email are required.'); return; }
    if (password && password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password && password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await registerUser(name, email);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Hero */}
        <div className="hidden md:flex flex-col gap-6 space-y-2">
          <div className="flex items-center gap-3">
            <Image
              src="/jankotilogo.png"
              alt="Jankoti Logo"
              width={180}
              height={50}
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
            Create your account and start landing top interviews
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Jankoti ATS Checker equips job seekers and recruiters with enterprise-grade resume ranking algorithms.
          </p>
          <div className="space-y-3 pt-2">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                {perk}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="jankoti-card p-8 bg-white space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Create Account</h1>
            <p className="text-slate-600 text-xs mt-1">Get started with Jankoti ATS Resume Intelligence</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="register-name">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Candidate Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="register-email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="register-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="register-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm font-medium"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full btn-primary-gradient font-bold py-3.5 rounded-full shadow-lg flex items-center justify-center gap-2 text-base disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Create Free Account</span> <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 pt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-700 hover:underline font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navigation/Navbar';
import {
  Upload, FileText, X, AlertCircle, Briefcase,
  Building2, ChevronRight, ArrowRight, CheckCircle,
  Loader2, FileCheck, Sparkles
} from 'lucide-react';
import { uploadResume } from '@/services/resume';
import { runATSAnalysis } from '@/services/analysis';

interface UploadedFile {
  file: File;
  name: string;
  size: string;
  type: string;
}

const STAGES = [
  'Reading Resume File & Extracting Text…',
  'Extracting Candidate Technical & Soft Skills…',
  'Analyzing Target Job Description Requirements…',
  'Matching Keywords & Measuring Term Density…',
  'Calculating Weighted 6-Pillar ATS Score…',
  'Generating AI Recommendations & Bullet Rewrites…',
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'job' | 'analyzing'>('upload');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jdError, setJdError] = useState('');
  const [stageIndex, setStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const [analysisError, setAnalysisError] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);

  const validateFile = (file: File): string => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowed.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      return 'Please upload a PDF or DOCX file.';
    }
    if (file.size > 5 * 1024 * 1024) return 'File size exceeds 5MB limit.';
    return '';
  };

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) { setFileError(error); return; }
    setFileError('');
    setUploadedFile({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.name.endsWith('.docx') ? 'DOCX' : 'PDF',
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleAnalyze = async () => {
    if (!jobTitle.trim()) { setJdError('Job title is required.'); return; }
    if (jobDescription.trim().length < 40) { setJdError('Please enter a more descriptive job description (at least 40 characters).'); return; }
    setJdError('');
    setStep('analyzing');
    setStageIndex(0);
    setStageProgress(0);

    if (uploadedFile) {
      try { await uploadResume(uploadedFile.file); } catch { /* continue */ }
    }

    const runStages = async () => {
      for (let i = 0; i < STAGES.length; i++) {
        setStageIndex(i);
        setStageProgress(0);
        await new Promise<void>((resolve) => {
          let p = 0;
          const interval = setInterval(() => {
            p += Math.random() * 18 + 7;
            if (p >= 100) {
              setStageProgress(100);
              clearInterval(interval);
              resolve();
            } else {
              setStageProgress(Math.min(p, 95));
            }
          }, 110);
        });
        await new Promise((r) => setTimeout(r, 180));
      }
    };

    const [result] = await Promise.all([
      runATSAnalysis({
        resumeName: uploadedFile?.name || 'Candidate_Resume.pdf',
        jobTitle: jobTitle.trim(),
        targetCompany: targetCompany.trim(),
        jobDescription: jobDescription.trim(),
        resumeText: resumeText.trim(),
        file: uploadedFile?.file || null,
      }).catch((err) => {
        setAnalysisError(err.message || 'Analysis failed. Please try again.');
        return null;
      }),
      runStages(),
    ]);

    if (result) {
      router.push(`/analysis/${result.id}`);
    }
  };

  if (step === 'analyzing') {
    return (
      <div className="min-h-screen bg-[#080D1A] flex items-center justify-center px-4">
        {analysisError ? (
          <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-rose-500/30 text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Analysis Encountered an Issue</h2>
            <p className="text-slate-400 mb-6 text-sm">{analysisError}</p>
            <button onClick={() => { setStep('job'); setAnalysisError(''); }} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors">
              Try Again
            </button>
          </div>
        ) : (
          <div className="max-w-lg w-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto mb-6 relative shadow-lg shadow-orange-500/10">
              <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Jankoti ATS Scanner in Progress</h2>
            <p className="text-slate-400 text-sm mb-8">Evaluating keywords, format parsing, and role match…</p>
            <div className="space-y-3">
              {STAGES.map((stage, idx) => {
                const isActive = idx === stageIndex;
                const isDone = idx < stageIndex;
                return (
                  <div key={stage} className={`glass-card rounded-xl p-4 border transition-all ${isActive ? 'border-orange-500/50 bg-orange-500/5' : isDone ? 'border-emerald-500/30' : 'border-slate-800/80 opacity-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isActive ? 'text-orange-300' : isDone ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {stage}
                      </span>
                      {isDone && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      {isActive && <span className="text-xs text-orange-400 font-mono font-bold">{Math.round(stageProgress)}%</span>}
                    </div>
                    {isActive && (
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-indigo-500 rounded-full transition-all duration-150"
                          style={{ width: `${stageProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D1A]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          {['Upload Resume', 'Job Description'].map((label, idx) => {
            const current = step === 'upload' ? 0 : 1;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${idx <= current ? 'bg-orange-500 border-orange-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                  {idx < current ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-sm font-medium ${idx <= current ? 'text-slate-200' : 'text-slate-500'}`}>{label}</span>
                {idx < 1 && <ChevronRight className="w-4 h-4 text-slate-700" />}
              </div>
            );
          })}
        </div>

        {step === 'upload' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Upload Your Resume</h1>
              <p className="text-slate-400">Accepted formats: PDF or DOCX (max 5MB)</p>
            </div>

            {/* Drop Zone */}
            <div
              id="resume-drop-zone"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`glass-card rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 hover:border-orange-500/50'}`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,.docx,.doc"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
              />
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
                <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-orange-400' : 'text-orange-400'}`} />
              </div>
              <p className="text-white font-bold text-lg mb-1">
                {isDragging ? 'Drop your resume file here' : 'Drag & drop your resume file here'}
              </p>
              <p className="text-slate-500 text-sm mb-4">or click to browse files from your computer</p>
              <div className="flex items-center justify-center gap-3">
                {['PDF', 'DOCX'].map((fmt) => (
                  <span key={fmt} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 font-mono">
                    .{fmt.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>

            {fileError && (
              <div className="flex items-center gap-2 mt-3 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {fileError}
              </div>
            )}

            {/* File Preview */}
            {uploadedFile && (
              <div className="mt-4 glass-card rounded-xl p-4 border border-emerald-500/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{uploadedFile.name}</p>
                  <p className="text-slate-500 text-xs">{uploadedFile.type} • {uploadedFile.size}</p>
                </div>
                <button onClick={() => setUploadedFile(null)} className="text-slate-500 hover:text-rose-400 transition-colors p-1 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-center text-slate-500 text-sm mt-5">
              Want to test without a file?{' '}
              <button onClick={() => setStep('job')} className="text-orange-400 hover:underline font-semibold">
                Skip to Job Description
              </button>
            </p>

            {/* Optional: Paste Resume Text for better matching */}
            <div className="mt-6 glass-card rounded-xl border border-slate-700/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPasteBox(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span className="font-medium">Paste resume text for accurate skill matching</span>
                  <span className="text-xs text-slate-500">(recommended)</span>
                </span>
                <span className="text-slate-600">{showPasteBox ? '▲' : '▼'}</span>
              </button>
              {showPasteBox && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-slate-500 mb-2">
                    Copy and paste your resume content below. This enables word-level, alias, and abbreviation matching (e.g. ML → Machine Learning, sklearn → Scikit-learn, PowerBI → Power BI).
                  </p>
                  <textarea
                    id="resume-text-input"
                    rows={8}
                    placeholder="Paste your full resume text here (Skills, Experience, Education…)"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition-all text-sm resize-none font-mono text-xs leading-relaxed"
                  />
                  {resumeText.trim().length > 20 && (
                    <p className="mt-1.5 text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Resume text loaded — skill matching will use real content.
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              id="upload-continue-btn"
              onClick={() => setStep('job')}
              disabled={!!fileError}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
            >
              Continue to Job Description
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'job' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Target Job Description</h1>
              <p className="text-slate-400">Enter the role requirements to measure ATS compatibility</p>
            </div>

            {uploadedFile && (
              <div className="flex items-center gap-2 glass-card rounded-lg px-4 py-2.5 border border-emerald-500/20 mb-6 text-sm">
                <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300 truncate">{uploadedFile.name}</span>
                <button onClick={() => setStep('upload')} className="ml-auto text-orange-400 hover:text-orange-300 text-xs underline flex-shrink-0">
                  Change File
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="job-title">
                    Job Title <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="job-title"
                      type="text"
                      placeholder="e.g. Senior Full Stack Developer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="company-name">
                    Company <span className="text-slate-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="company-name"
                      type="text"
                      placeholder="e.g. Jankoti Technologies"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="job-description">
                    Job Description <span className="text-orange-400">*</span>
                  </label>
                  <span className="text-xs text-slate-500">{jobDescription.length} / 5000 characters</span>
                </div>
                <textarea
                  id="job-description"
                  rows={9}
                  placeholder="Paste the full job requirements, skills, and qualifications here…"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value.slice(0, 5000))}
                  className="w-full px-4 py-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition-all text-sm resize-none"
                />
              </div>

              {jdError && (
                <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {jdError}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setStep('upload')} className="px-5 py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 rounded-xl font-medium transition-all text-sm">
                ← Back
              </button>
              <button
                id="analyze-btn"
                onClick={handleAnalyze}
                disabled={!jobTitle.trim() || jobDescription.trim().length < 40}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
              >
                <Sparkles className="w-4 h-4" />
                Start ATS Analysis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

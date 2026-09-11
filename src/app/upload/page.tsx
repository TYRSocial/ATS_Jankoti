'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload, FileText, X, AlertCircle, Briefcase,
  Building2, ChevronRight, ArrowRight, CheckCircle,
  Loader2, FileCheck, Sparkles, Globe, Link2, DownloadCloud
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
  const [jdInputMode, setJdInputMode] = useState<'text' | 'url'>('text');
  const [jobUrl, setJobUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const [scrapeSuccess, setScrapeSuccess] = useState('');

  const handleScrapeUrl = async () => {
    if (!jobUrl.trim() || !jobUrl.startsWith('http')) {
      setScrapeError('Please enter a valid job post URL starting with http:// or https://');
      return;
    }
    setScrapeError('');
    setScrapeSuccess('');
    setIsScraping(true);
    try {
      const res = await fetch('/api/scrape-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.jobTitle) setJobTitle(data.jobTitle);
        if (data.targetCompany) setTargetCompany(data.targetCompany);
        if (data.jobDescription) setJobDescription(data.jobDescription);
        setScrapeSuccess('Job posting fetched successfully!');
      } else {
        setScrapeError(data.error || 'Failed to extract job details from link.');
      }
    } catch (err: any) {
      setScrapeError(err.message || 'Error fetching URL. Please paste the job description text manually.');
    } finally {
      setIsScraping(false);
    }
  };

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

    let activeResumeText = resumeText.trim();
    if (uploadedFile) {
      try {
        const uploadRes = await uploadResume(uploadedFile.file);
        if (uploadRes && uploadRes.extractedText && uploadRes.extractedText.trim().length > 10) {
          const fileText = uploadRes.extractedText.trim();
          activeResumeText = activeResumeText ? `${activeResumeText}\n\n${fileText}` : fileText;
        }
      } catch (err) {
        console.warn('[UploadPage] Upload failed, proceeding with fallback text extraction:', err);
      }
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
        resumeText: activeResumeText,
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
      <div className="py-12 flex items-center justify-center">
        {analysisError ? (
          <div className="max-w-md w-full jankoti-card p-8 border-rose-200 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Analysis Issue Encountered</h2>
            <p className="text-slate-600 mb-6 text-sm">{analysisError}</p>
            <button onClick={() => { setStep('job'); setAnalysisError(''); }} className="px-6 py-2.5 btn-primary-gradient rounded-full font-semibold text-white">
              Try Again
            </button>
          </div>
        ) : (
          <div className="max-w-lg w-full text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-purple-100 border border-purple-200 flex items-center justify-center mx-auto shadow-md">
              <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Jankoti ATS Scanner in Progress</h2>
              <p className="text-slate-600 text-sm">Evaluating keywords, format compliance, and skill match…</p>
            </div>
            <div className="space-y-3 text-left">
              {STAGES.map((stage, idx) => {
                const isActive = idx === stageIndex;
                const isDone = idx < stageIndex;
                return (
                  <div key={stage} className={`jankoti-card p-4 transition-all ${isActive ? 'border-purple-400 bg-purple-50/70' : isDone ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-semibold ${isActive ? 'text-purple-700' : isDone ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {stage}
                      </span>
                      {isDone && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      {isActive && <span className="text-xs text-purple-700 font-mono font-bold">{Math.round(stageProgress)}%</span>}
                    </div>
                    {isActive && (
                      <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-amber-500 rounded-full transition-all duration-150"
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
    <div className="max-w-3xl mx-auto py-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-10 justify-center">
        {['Upload Resume', 'Job Description'].map((label, idx) => {
          const current = step === 'upload' ? 0 : 1;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${idx <= current ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                {idx < current ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`text-sm font-semibold ${idx <= current ? 'text-purple-900' : 'text-slate-400'}`}>{label}</span>
              {idx < 1 && <ChevronRight className="w-4 h-4 text-slate-300" />}
            </div>
          );
        })}
      </div>

      {step === 'upload' && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900">Upload Your Resume</h1>
            <p className="text-slate-600 text-sm">Supported formats: PDF or DOCX (max 5MB file size)</p>
          </div>

          {/* Drop Zone */}
          <div
            id="resume-drop-zone"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`jankoti-card border-2 border-dashed p-12 text-center cursor-pointer transition-all ${isDragging ? 'border-purple-500 bg-purple-50/50' : 'border-purple-200 hover:border-purple-400'}`}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />
            <div className="w-16 h-16 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-slate-900 font-bold text-lg mb-1">
              {isDragging ? 'Drop your resume file here' : 'Drag & drop your resume file here'}
            </p>
            <p className="text-slate-500 text-sm mb-4">or click to browse files from your computer</p>
            <div className="flex items-center justify-center gap-3">
              {['PDF', 'DOCX'].map((fmt) => (
                <span key={fmt} className="px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-xs text-purple-700 font-semibold">
                  .{fmt.toLowerCase()}
                </span>
              ))}
            </div>
          </div>

          {fileError && (
            <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {fileError}
            </div>
          )}

          {/* File Selected Badge */}
          {uploadedFile && (
            <div className="jankoti-card p-4 border-emerald-300 bg-emerald-50/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 font-bold text-sm truncate">{uploadedFile.name}</p>
                <p className="text-slate-500 text-xs">{uploadedFile.type} • {uploadedFile.size}</p>
              </div>
              <button onClick={() => setUploadedFile(null)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-center text-slate-500 text-sm">
            Want to test without uploading a file?{' '}
            <button onClick={() => setStep('job')} className="text-purple-600 hover:underline font-bold">
              Skip to Job Description
            </button>
          </p>

          {/* Optional: Paste Resume Text */}
          <div className="jankoti-card border-purple-100 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowPasteBox(v => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm text-slate-700 hover:bg-purple-50/50 transition-colors"
            >
              <span className="flex items-center gap-2 font-semibold">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Paste resume text for alias & keyword matching</span>
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full font-normal">(recommended)</span>
              </span>
              <span className="text-slate-400">{showPasteBox ? '▲' : '▼'}</span>
            </button>
            {showPasteBox && (
              <div className="px-5 pb-5 pt-2 border-t border-purple-100 space-y-3">
                <p className="text-xs text-slate-500">
                  Paste raw text to enable deep skill matching (e.g. ML → Machine Learning, ReactJS → React, PySpark → Spark).
                </p>
                <textarea
                  id="resume-text-input"
                  rows={7}
                  placeholder="Paste your resume content (Skills, Experience, Education…)"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-xs font-mono leading-relaxed resize-none"
                />
              </div>
            )}
          </div>

          <button
            id="upload-continue-btn"
            onClick={() => setStep('job')}
            disabled={!!fileError}
            className="w-full btn-primary-gradient font-bold py-3.5 rounded-full shadow-lg flex items-center justify-center gap-2 text-base disabled:opacity-50"
          >
            <span>Continue to Job Description</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 'job' && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-slate-900">Target Job Description</h1>
            <p className="text-slate-600 text-sm">Enter details or import directly from job site URLs (LinkedIn, Naukri, Indeed, etc.)</p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-full bg-slate-200/70 p-1 border border-slate-300 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setJdInputMode('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-bold transition-all ${
                jdInputMode === 'text'
                  ? 'bg-white text-purple-700 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Paste Manually
            </button>
            <button
              type="button"
              onClick={() => setJdInputMode('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-bold transition-all ${
                jdInputMode === 'url'
                  ? 'bg-white text-purple-700 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Import Job Link
            </button>
          </div>

          {/* URL Importer */}
          {jdInputMode === 'url' && (
            <div className="jankoti-card p-6 border-purple-200 bg-purple-50/40 space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                <h3 className="text-slate-900 font-bold text-base">Fetch Job Details from Web</h3>
              </div>
              <p className="text-slate-600 text-xs">
                Paste the URL of any job post from <strong className="text-slate-900">Naukri, Internshala, LinkedIn, Indeed, or Glassdoor</strong> to auto-extract position details.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://www.naukri.com/job-listings... or https://linkedin.com/jobs/..."
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleScrapeUrl}
                  disabled={isScraping || !jobUrl.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 btn-primary-gradient font-bold rounded-xl text-xs text-white disabled:opacity-50 flex-shrink-0 shadow-md"
                >
                  {isScraping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Fetching…
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="w-4 h-4" />
                      Fetch Details
                    </>
                  )}
                </button>
              </div>

              {scrapeError && (
                <div className="flex items-center gap-2 text-rose-600 text-xs bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {scrapeError}
                </div>
              )}

              {scrapeSuccess && (
                <div className="flex items-center gap-2 text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {scrapeSuccess}
                </div>
              )}
            </div>
          )}

          {uploadedFile && (
            <div className="flex items-center gap-2 jankoti-card px-4 py-2.5 border-emerald-200 bg-emerald-50/30 text-xs font-medium">
              <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-slate-800 truncate">{uploadedFile.name}</span>
              <button onClick={() => setStep('upload')} className="ml-auto text-purple-600 hover:underline font-bold flex-shrink-0">
                Change File
              </button>
            </div>
          )}

          <div className="jankoti-card p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="job-title">
                  Job Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="job-title"
                    type="text"
                    placeholder="e.g. Senior Full Stack Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5" htmlFor="company-name">
                  Company <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="company-name"
                    type="text"
                    placeholder="e.g. Jankoti Technologies"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="job-description">
                  Job Description <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400">{jobDescription.length} / 5000 chars</span>
              </div>
              <textarea
                id="job-description"
                rows={9}
                placeholder="Paste the full target job requirements, skills, and qualifications here…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value.slice(0, 5000))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm leading-relaxed resize-none"
              />
            </div>

            {jdError && (
              <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {jdError}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setStep('upload')} className="px-6 py-3 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-full font-semibold transition-all text-sm">
              ← Back
            </button>
            <button
              id="analyze-btn"
              onClick={handleAnalyze}
              disabled={!jobTitle.trim() || jobDescription.trim().length < 40}
              className="flex-1 btn-primary-gradient font-bold py-3.5 rounded-full shadow-lg flex items-center justify-center gap-2 text-base disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              <span>Start ATS Analysis</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

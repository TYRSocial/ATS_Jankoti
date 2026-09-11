import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Analysis } from '@/models/Analysis';

export const dynamic = 'force-dynamic';
import { generateDynamicAnalysis } from '@/lib/mockData';
import { parsePdfBuffer } from '@/lib/pdfParser';
import mammoth from 'mammoth';

const LLAMA_API_URL = 'https://test.jankoti.com/v1/chat/completions';
const LLAMA_API_KEY = 'aip_dev_2b47f46c12cd08f7_7HFU_GK0xvjn5-VFI3biwuf0kRKTWczugyVgWG4gT2c';
const LLAMA_TIMEOUT_MS = 15000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACTION_VERBS = /^(led|built|designed|developed|architected|implemented|managed|delivered|created|improved|automated|optimized|launched|scaled|reduced|increased|deployed|integrated|established|mentored|collaborated|analyzed|migrated|maintained|contributed|engineered|streamlined)/i;

function extractSentences(text: string, minLen = 50): string[] {
  return text
    .split(/[\n\r]+/)
    .map(l => l.trim())
    .filter(l =>
      l.length >= minLen &&
      // Skip all-caps headings (e.g. "EXPERIENCE", "EDUCATION")
      !/^[A-Z\s|–\-]{4,}$/.test(l) &&
      // Skip lines that are mostly a date or short label
      !/^\d{4}/.test(l) &&
      !/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(l) &&
      // Skip university/college header-style lines
      !/department|university|college|b\.tech|b\.e\.|m\.tech|academic year/i.test(l) &&
      // Prefer lines that look like real bullets or sentences
      l.split(' ').length >= 6
    )
    .slice(0, 40);
}

function buildLocalFallback(
  resumeText: string,
  jobTitle: string,
  matchedKeywords: string[],
  missingKeywords: string[]
) {
  const sentences = extractSentences(resumeText);
  const firstMissing = missingKeywords[0] || 'relevant technology';
  const firstMatched = matchedKeywords[0] || 'core skills';

  // Prefer action-verb lines; fall back to any long-enough sentence
  const actionLines = sentences.filter(s => ACTION_VERBS.test(s)).slice(0, 3);
  const bulletLines = actionLines.length >= 1
    ? actionLines
    : sentences.filter(s => s.length > 50).slice(0, 3);

  const bulletSuggestions = bulletLines.map((line, i) => ({
    id: `bullet-local-${i + 1}`,
    section: 'Experience',
    original: line,
    suggested: `Led and delivered ${line.replace(/^[-•*–\d.]+\s*/, '').toLowerCase().trim()} — integrating ${firstMissing} to increase efficiency by 30% and reduce delivery time by 2 sprints.`,
    explanation: `Added quantified business impact and integrated missing keyword "${firstMissing}" required by the job description.`,
    status: 'PENDING' as const,
  }));

  while (bulletSuggestions.length < 3) {
    const idx = bulletSuggestions.length + 1;
    bulletSuggestions.push({
      id: `bullet-local-${idx}`,
      section: 'Experience',
      original: `Responsible for ${jobTitle} tasks and delivery.`,
      suggested: `Architected and shipped ${jobTitle} solutions using ${firstMatched}, reducing deployment errors by 40% across 3 product releases.`,
      explanation: `Replaced passive wording with an action verb, added matched keyword "${firstMatched}", and quantified the outcome.`,
      status: 'PENDING' as const,
    });
  }

  const matchRatio = matchedKeywords.length / Math.max(matchedKeywords.length + missingKeywords.length, 1);

  const sectionAudits = [
    {
      name: 'Summary',
      score: sentences.length > 5 ? 78 : 55,
      status: sentences.length > 5 ? 'PASSED' : 'WARNING',
      issues: sentences.length <= 5 ? ['Summary appears very short or is missing'] : ['Could be more targeted to the role'],
      suggestions: [`Mention "${jobTitle}" explicitly in your professional summary.`],
    },
    {
      name: 'Experience',
      score: matchedKeywords.length > 3 ? 80 : 60,
      status: matchedKeywords.length > 3 ? 'PASSED' : 'WARNING',
      issues: missingKeywords.length > 0 ? [`Missing references to: ${missingKeywords.slice(0, 4).join(', ')}`] : [],
      suggestions: [`Weave in "${firstMissing}" into relevant bullet points if you have experience with it.`],
    },
    {
      name: 'Skills',
      score: Math.max(10, Math.round(matchRatio * 100)),
      status: missingKeywords.length > 2 ? 'WARNING' : 'PASSED',
      issues: missingKeywords.length > 0 ? [`${missingKeywords.length} keyword(s) from the JD not found in skills section`] : [],
      suggestions: ['Organise skills into: Technical, Tools, Soft Skills, Domain Expertise.'],
    },
    {
      name: 'Education',
      score: 90,
      status: 'PASSED',
      issues: [],
      suggestions: ['Education section is clear and ATS-readable.'],
    },
    {
      name: 'Formatting & Structure',
      score: 75,
      status: 'WARNING',
      issues: ['Ensure single-column layout for maximum ATS parseability'],
      suggestions: ['Use standard section headings: Summary, Experience, Skills, Education, Projects.'],
    },
  ];

  const recommendations = [
    ...missingKeywords.slice(0, 2).map((kw, i) => ({
      id: `rec-missing-${i + 1}`,
      problem: `Missing Keyword: ${kw}`,
      recommendation: `"${kw}" appears in the job description. Add it to your Skills section or weave it into a relevant bullet point.`,
      impact: 'HIGH' as const,
      section: 'Skills',
    })),
    {
      id: 'rec-metrics',
      problem: 'Add Quantified Metrics',
      recommendation: 'Strengthen experience bullets with numbers: % efficiency gained, $ revenue impacted, users served, sprints saved.',
      impact: 'HIGH' as const,
      section: 'Experience',
    },
    {
      id: 'rec-format',
      problem: 'ATS Format Compatibility',
      recommendation: 'Avoid tables, text boxes, and images. Use a single-column layout with standard section headers.',
      impact: 'MEDIUM' as const,
      section: 'Formatting',
    },
  ];

  return { sectionAudits, recommendations, bulletSuggestions };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let jobTitle = '';
    let targetCompany = '';
    let jobDescription = '';
    let resumeText = '';
    let resumeName = 'Uploaded_Resume.pdf';
    const userId = request.headers.get('x-user-id') || undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      jobTitle = (formData.get('jobTitle') as string) || '';
      targetCompany = (formData.get('targetCompany') as string) || '';
      jobDescription = (formData.get('jobDescription') as string) || '';
      resumeText = (formData.get('resumeText') as string) || '';
      const file = formData.get('file') as File | null;
      if (file) {
        resumeName = file.name;
        if (!resumeText) {
          try {
            const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
            const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx');
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            if (isPdf) {
              resumeText = await parsePdfBuffer(buffer);
            } else if (isDocx) {
              const result = await mammoth.extractRawText({ buffer });
              resumeText = result.value || '';
            }
          } catch (fileParseErr) {
            console.warn('[Analysis Route] Automatic file text extraction warning:', fileParseErr);
          }
        }
      }
    } else {
      const body = await request.json().catch(() => ({}));
      jobTitle = body.jobTitle || '';
      targetCompany = body.targetCompany || '';
      jobDescription = body.jobDescription || '';
      resumeText = body.resumeText || '';
      resumeName = body.resumeName || resumeName;
    }

    if (!jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: 'jobTitle and jobDescription are required' },
        { status: 400 }
      );
    }

    // Step 1 — Deterministic scoring via skill matcher
    const analysisData = generateDynamicAnalysis(resumeName, jobTitle, targetCompany, jobDescription, resumeText);

    // Step 2 — LLM enrichment with timeout
    let llmUsed = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), LLAMA_TIMEOUT_MS);

      const prompt = `You are an expert ATS resume reviewer. Analyze this resume against the job description.

Job Title: "${jobTitle}"
Company: "${targetCompany || 'Target Company'}"

RESUME TEXT:
"""
${resumeText.slice(0, 3000)}
"""

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 1500)}
"""

Already matched keywords: ${analysisData.matchedKeywords.slice(0, 10).join(', ')}
Missing keywords from JD: ${analysisData.missingKeywords.slice(0, 10).join(', ')}

Respond with ONLY a valid JSON object (no markdown, no backticks) with exactly these 3 keys:
{
  "sectionAudits": [
    { "name": "Summary", "score": 0-100, "status": "PASSED|WARNING|FAILED", "issues": ["..."], "suggestions": ["..."] },
    { "name": "Experience", "score": 0-100, "status": "PASSED|WARNING|FAILED", "issues": ["..."], "suggestions": ["..."] },
    { "name": "Skills", "score": 0-100, "status": "PASSED|WARNING|FAILED", "issues": ["..."], "suggestions": ["..."] },
    { "name": "Education", "score": 0-100, "status": "PASSED|WARNING|FAILED", "issues": ["..."], "suggestions": ["..."] },
    { "name": "Formatting & Structure", "score": 0-100, "status": "PASSED|WARNING|FAILED", "issues": ["..."], "suggestions": ["..."] }
  ],
  "recommendations": [
    { "id": "rec-1", "problem": "short issue title", "recommendation": "detailed action", "impact": "HIGH|MEDIUM|LOW", "section": "Skills|Experience|Education|Formatting" }
  ],
  "bulletSuggestions": [
    { "id": "bullet-1", "section": "Experience", "original": "exact line from resume", "suggested": "improved version with action verb + keyword + metric", "explanation": "why this is better" },
    { "id": "bullet-2", "section": "Experience", "original": "exact line from resume", "suggested": "improved version", "explanation": "why this is better" },
    { "id": "bullet-3", "section": "Experience", "original": "exact line from resume", "suggested": "improved version", "explanation": "why this is better" }
  ]
}`;

      const response = await fetch(LLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LLAMA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'general-default',
          messages: [
            { role: 'system', content: 'You are a professional ATS resume analyst. Always respond with valid JSON only.' },
            { role: 'user', content: prompt },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const payload = await response.json();
        const contentText: string = payload?.choices?.[0]?.message?.content || '';

        // Strip any markdown or preamble text wrapping the JSON
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const llmResult = JSON.parse(jsonMatch[0]);

          if (Array.isArray(llmResult.sectionAudits) && llmResult.sectionAudits.length > 0) {
            analysisData.sectionAudits = llmResult.sectionAudits;
          }
          if (Array.isArray(llmResult.recommendations) && llmResult.recommendations.length > 0) {
            analysisData.recommendations = llmResult.recommendations.map((rec: any, idx: number) => ({
              ...rec,
              id: rec.id || `rec-llama-${idx}`,
            }));
          }
          if (Array.isArray(llmResult.bulletSuggestions) && llmResult.bulletSuggestions.length > 0) {
            analysisData.bulletSuggestions = llmResult.bulletSuggestions.map((b: any, idx: number) => ({
              ...b,
              id: b.id || `bullet-llama-${idx}`,
              status: 'PENDING',
            }));
          }
          llmUsed = true;
        }
      } else {
        console.warn(`[Llama API] ${response.status} ${response.statusText} — using local fallback.`);
      }
    } catch (llmErr: any) {
      if (llmErr?.name === 'AbortError') {
        console.warn('[Llama API] Timed out — using local fallback.');
      } else {
        console.warn('[Llama API] Error:', llmErr?.message || llmErr);
      }
    }

    // Step 3 — Rich local fallback if LLM not available
    if (!llmUsed) {
      const fallback = buildLocalFallback(
        resumeText,
        jobTitle,
        analysisData.matchedKeywords,
        analysisData.missingKeywords
      );
      analysisData.sectionAudits = fallback.sectionAudits as any;
      analysisData.recommendations = fallback.recommendations as any;
      analysisData.bulletSuggestions = fallback.bulletSuggestions as any;
    }

    // Step 4 — Persist to MongoDB (with memory cache fallback)
    const memoryScans: Map<string, any> = (globalThis as any)._memoryScans || ((globalThis as any)._memoryScans = new Map());
    memoryScans.set(analysisData.id, analysisData);

    try {
      await connectDB();
      const doc = await Analysis.create({
        userId,
        resumeName: analysisData.resumeName,
        resumeFileSize: analysisData.resumeFileSize,
        jobTitle: analysisData.jobTitle,
        targetCompany: analysisData.targetCompany,
        jobDescriptionText: jobDescription,
        overallScore: analysisData.overallScore,
        scoreRating: analysisData.scoreRating,
        categoryScores: analysisData.categoryScores,
        matchedKeywords: analysisData.matchedKeywords,
        missingKeywords: analysisData.missingKeywords,
        partialKeywords: analysisData.partialKeywords,
        keywordDetails: analysisData.keywordDetails,
        skillComparison: analysisData.skillComparison,
        sectionAudits: analysisData.sectionAudits,
        recommendations: analysisData.recommendations,
        bulletSuggestions: analysisData.bulletSuggestions,
      });

      const dbResult = {
        ...analysisData,
        id: doc._id.toString(),
        createdAt: doc.createdAt.toISOString(),
      };
      memoryScans.set(dbResult.id, dbResult);
      memoryScans.set(analysisData.id, dbResult);

      return NextResponse.json(dbResult, { status: 201 });
    } catch (dbErr) {
      console.warn('[MongoDB] Not reachable — scan cached in memory, returning dynamic result.');
      return NextResponse.json(analysisData, { status: 201 });
    }
  } catch (error) {
    console.error('[API /api/analysis POST]', error);
    return NextResponse.json(
      { error: 'Failed to process analysis. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Analysis } from '@/models/Analysis';
import { generateDynamicAnalysis } from '@/lib/mockData';

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
      if (file) resumeName = file.name;
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

    const analysisData = generateDynamicAnalysis(resumeName, jobTitle, targetCompany, jobDescription, resumeText);

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

      return NextResponse.json({
        ...analysisData,
        id: doc._id.toString(),
        createdAt: doc.createdAt.toISOString(),
      }, { status: 201 });
    } catch (dbErr) {
      console.warn('[MongoDB] Database not reachable, returning dynamic result directly:', dbErr);
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

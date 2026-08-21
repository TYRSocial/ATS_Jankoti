import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF or DOCX file.' },
        { status: 422 }
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      fileId: `file-${Date.now()}`,
      filename: file.name,
      size: file.size,
      type: file.type,
      extractedText: `[Extracted resume content from ${file.name}]`,
    });
  } catch (error) {
    console.error('[API /api/resume/upload POST]', error);
    return NextResponse.json({ error: 'Failed to upload resume' }, { status: 500 });
  }
}

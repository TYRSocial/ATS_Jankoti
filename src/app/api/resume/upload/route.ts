import { NextRequest, NextResponse } from 'next/server';
import { parsePdfBuffer } from '@/lib/pdfParser';
import mammoth from 'mammoth';

export const dynamic = 'force-dynamic';

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

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                   file.name.endsWith('.docx');

    if (!isPdf && !isDocx) {
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = '';

    if (isPdf) {
      try {
        extractedText = await parsePdfBuffer(buffer);
      } catch (pdfErr) {
        console.error('[PDF Parsing Error]', pdfErr);
        return NextResponse.json({ error: 'Failed to parse PDF document.' }, { status: 500 });
      }
    } else if (isDocx) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      } catch (docxErr) {
        console.error('[DOCX Parsing Error]', docxErr);
        return NextResponse.json({ error: 'Failed to parse Word document.' }, { status: 500 });
      }
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'The uploaded file appears to be empty or contains non-extractable text (e.g. image-only PDF).' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      fileId: `file-${Date.now()}`,
      filename: file.name,
      size: file.size,
      type: file.type,
      extractedText: extractedText,
    });
  } catch (error) {
    console.error('[API /api/resume/upload POST]', error);
    return NextResponse.json({ error: 'Failed to upload and parse resume' }, { status: 500 });
  }
}

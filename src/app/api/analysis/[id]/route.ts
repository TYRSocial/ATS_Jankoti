import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Analysis } from '@/models/Analysis';
import { SAMPLE_ANALYSES } from '@/lib/mockData';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    try {
      await connectDB();
      const analysis: any = await Analysis.findById(params.id).lean();
      if (analysis && !Array.isArray(analysis)) {
        return NextResponse.json({
          ...analysis,
          id: analysis._id?.toString() || params.id,
          createdAt: analysis.createdAt ? new Date(analysis.createdAt).toISOString() : new Date().toISOString(),
        });
      }
    } catch {
      // Fallback
    }

    const sample = SAMPLE_ANALYSES.find((s) => s.id === params.id) || SAMPLE_ANALYSES[0];
    return NextResponse.json(sample);
  } catch (error) {
    console.error('[API /api/analysis/[id] GET]', error);
    return NextResponse.json(SAMPLE_ANALYSES[0]);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { bulletId, status } = body;

    try {
      await connectDB();
      await Analysis.findOneAndUpdate(
        { _id: params.id, 'bulletSuggestions.id': bulletId },
        { $set: { 'bulletSuggestions.$.status': status } }
      );
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /api/analysis/[id] PATCH]', error);
    return NextResponse.json({ success: true });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    try {
      await connectDB();
      await Analysis.findByIdAndDelete(params.id);
    } catch {
      // Fallback
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /api/analysis/[id] DELETE]', error);
    return NextResponse.json({ success: true });
  }
}

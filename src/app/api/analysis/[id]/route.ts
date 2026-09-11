import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Analysis } from '@/models/Analysis';
import { SAMPLE_ANALYSES } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Check MongoDB
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
      // DB unreachable
    }

    // 2. Check in-memory scans cache
    const memoryScans: Map<string, any> = (globalThis as any)._memoryScans;
    if (memoryScans && memoryScans.has(params.id)) {
      return NextResponse.json(memoryScans.get(params.id));
    }

    // 3. Check sample analyses (exact match on id only!)
    const sample = SAMPLE_ANALYSES.find((s) => s.id === params.id);
    if (sample) {
      return NextResponse.json(sample);
    }

    // 4. Return 404 so client service falls back to localStorage
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
  } catch (error) {
    console.error('[API /api/analysis/[id] GET]', error);
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
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

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Analysis } from '@/models/Analysis';
import { SAMPLE_ANALYSES } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || request.headers.get('x-user-id');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    try {
      await connectDB();
      const query = userId ? { userId } : {};

      const [analyses, total] = await Promise.all([
        Analysis.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Analysis.countDocuments(query),
      ]);

      if (analyses.length > 0) {
        const results = (analyses as any[]).map((a: any) => ({
          ...a,
          id: a._id?.toString() || a.id,
          createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
        }));

        return NextResponse.json({
          data: results,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        });
      }
    } catch (dbErr) {
      console.warn('[MongoDB] Database not reachable, using mock history:', dbErr);
    }

    return NextResponse.json({
      data: SAMPLE_ANALYSES,
      total: SAMPLE_ANALYSES.length,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
  } catch (error) {
    console.error('[API /api/analysis/history GET]', error);
    return NextResponse.json({ data: SAMPLE_ANALYSES, total: SAMPLE_ANALYSES.length });
  }
}

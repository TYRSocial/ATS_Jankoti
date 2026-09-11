import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Analysis } from '@/models/Analysis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || request.headers.get('x-user-id');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    let dbResults: any[] = [];
    let total = 0;

    try {
      await connectDB();
      const query = userId ? { userId } : {};

      const [analyses, count] = await Promise.all([
        Analysis.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Analysis.countDocuments(query),
      ]);

      dbResults = (analyses as any[]).map((a: any) => ({
        ...a,
        id: a._id?.toString() || a.id,
        createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
      }));
      total = count;
    } catch (dbErr) {
      console.warn('[MongoDB] Database not reachable for history:', dbErr);
    }

    // Merge in-memory cached scans
    const memoryScansMap: Map<string, any> = (globalThis as any)._memoryScans;
    const memoryScans = memoryScansMap ? Array.from(memoryScansMap.values()) : [];

    const combinedMap = new Map<string, any>();
    for (const item of memoryScans) combinedMap.set(item.id, item);
    for (const item of dbResults) combinedMap.set(item.id, item);

    const finalResults = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    return NextResponse.json({
      data: finalResults,
      total: Math.max(total, finalResults.length),
      page,
      limit,
      totalPages: Math.ceil(Math.max(total, finalResults.length) / limit) || 1,
    });
  } catch (error) {
    console.error('[API /api/analysis/history GET]', error);
    return NextResponse.json({ data: [], total: 0, page: 1, limit: 20, totalPages: 1 });
  }
}

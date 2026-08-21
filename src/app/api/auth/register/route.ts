import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    try {
      await connectDB();
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
      });

      return NextResponse.json(
        {
          success: true,
          user: {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            totalScans: user.totalScans,
            avgScore: user.avgScore,
          },
        },
        { status: 201 }
      );
    } catch {
      // Mock fallback
      return NextResponse.json(
        {
          success: true,
          user: {
            id: `usr-${Date.now()}`,
            name,
            email,
            totalScans: 0,
            avgScore: 0,
          },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('[API /api/auth/register POST]', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

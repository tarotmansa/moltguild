import { NextResponse } from 'next/server';
import { listSquads, getMemberships } from '@/lib/storage';

// GET /api/squads/list?gig=colosseum&skills=solana,frontend&status=open&sort=bestMatch
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gig = searchParams.get('gig') || searchParams.get('gigId') || undefined; // gigId deprecated
    const skills = (searchParams.get('skills') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const status = searchParams.get('status') || undefined;
    const sort = searchParams.get('sort') || undefined;

    const squads = await listSquads({ gig });

    // Include member counts + matchScore
    const squadsWithCounts = await Promise.all(squads.map(async (squad) => {
      const memberCount = (await getMemberships(squad.id)).length;
      const needed = squad.skillsNeeded || [];
      const overlap = skills.length
        ? skills.filter((s) => needed.includes(s)).length
        : 0;
      const matchScore = skills.length && needed.length
        ? overlap / needed.length
        : 0;

      return { ...squad, memberCount, matchScore };
    }));

    // Filter status if provided
    const filtered = status
      ? squadsWithCounts.filter((s) => (s.status || 'open') === status)
      : squadsWithCounts;

    // Sort
    const sorted = [...filtered];
    if (sort === 'bestMatch') {
      sorted.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    } else if (sort === 'memberCount') {
      sorted.sort((a, b) => (a.memberCount || 0) - (b.memberCount || 0));
    } else if (sort === 'lastActive') {
      sorted.sort((a, b) => (b.lastActive || 0) - (a.lastActive || 0));
    } else if (sort === 'createdAt') {
      sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return NextResponse.json({
      success: true,
      squads: sorted,
      count: sorted.length,
    });
  } catch (error: any) {
    console.error('List squads error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list squads' },
      { status: 500 }
    );
  }
}

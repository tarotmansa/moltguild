import { NextResponse } from 'next/server';
import { listSquads, getMemberships } from '@/lib/storage';

// GET /api/squads/list?gigId=colosseum - List squads (off-chain)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gigId = searchParams.get('gigId') || undefined;
    
    const squads = await listSquads({ gigId });
    
    // Include member counts
    const squadsWithCounts = await Promise.all(squads.map(async (squad) => ({
      ...squad,
      memberCount: (await getMemberships(squad.id)).length,
    })));
    
    return NextResponse.json({
      success: true,
      squads: squadsWithCounts,
      count: squadsWithCounts.length,
    });
  } catch (error: any) {
    console.error('List squads error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list squads' },
      { status: 500 }
    );
  }
}

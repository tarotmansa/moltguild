import { NextResponse } from 'next/server';
import { listSquads, getSquadMembers } from '@/lib/storage';

// GET /api/squads/list?gigId=colosseum - List squads (off-chain)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gigId = searchParams.get('gigId') || undefined;
    
    const squads = listSquads({ gigId });
    
    // Include member counts
    const squadsWithCounts = squads.map(squad => ({
      ...squad,
      memberCount: getSquadMembers(squad.id).length,
    }));
    
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

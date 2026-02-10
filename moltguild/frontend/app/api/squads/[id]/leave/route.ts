import { NextResponse } from 'next/server';
import { getSquad, removeMembership, isSquadCaptain } from '@/lib/storage';

// POST /api/squads/[id]/leave - Leave a squad (off-chain)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { agentId } = await request.json();
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID required' },
        { status: 400 }
      );
    }
    
    const squad = await getSquad(id);
    if (!squad) {
      return NextResponse.json(
        { error: 'Squad not found' },
        { status: 404 }
      );
    }
    
    // Captain cannot leave (must transfer or dissolve squad)
    if (await isSquadCaptain(squad.id, agentId)) {
      return NextResponse.json(
        { error: 'Captain cannot leave. Transfer ownership or dissolve squad first.' },
        { status: 400 }
      );
    }
    
    const removed = await removeMembership(squad.id, agentId);
    
    if (!removed) {
      return NextResponse.json(
        { error: 'Not a member of this squad' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Left squad',
    });
  } catch (error: any) {
    console.error('Leave squad error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to leave squad' },
      { status: 500 }
    );
  }
}

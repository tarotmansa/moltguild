import { NextResponse } from 'next/server';
import { getSquad, getSquadMembers, getAgent } from '@/lib/storage';

// GET /api/squads/[id] - Get squad details with members (off-chain)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const squad = getSquad(id);
    
    if (!squad) {
      return NextResponse.json(
        { error: 'Squad not found' },
        { status: 404 }
      );
    }
    
    // Get members with full agent data
    const memberships = getSquadMembers(squad.id);
    const members = memberships.map(m => {
      const agent = getAgent(m.agentId);
      return {
        ...m,
        agent,
      };
    }).filter(m => m.agent); // filter out deleted agents
    
    return NextResponse.json({
      success: true,
      squad,
      members,
      memberCount: members.length,
    });
  } catch (error: any) {
    console.error('Get squad error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get squad' },
      { status: 500 }
    );
  }
}

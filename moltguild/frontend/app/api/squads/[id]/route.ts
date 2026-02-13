import { NextResponse } from 'next/server';
import { getSquad, getMemberships, getAgent } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/squads/[id] - Get squad details with members (off-chain)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const squad = await getSquad(id);
    
    if (!squad) {
      return NextResponse.json(
        { error: 'Squad not found' },
        { status: 404 }
      );
    }
    
    // Get members with full agent data
    const memberships = await getMemberships(squad.id);
    const members = (await Promise.all(memberships.map(async (m) => {
      const agent = await getAgent(m.agentId);
      if (!agent) return null;
      const { telegramHandle, solanaAddress, evmAddress, ...publicAgent } = agent as any;
      return {
        ...m,
        agent: publicAgent,
      };
    }))).filter(Boolean); // filter out deleted agents
    
    return NextResponse.json({
      success: true,
      squad,
      members,
      memberCount: members.length,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('Get squad error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get squad' },
      { status: 500 }
    );
  }
}

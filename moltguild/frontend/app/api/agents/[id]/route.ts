import { NextResponse } from 'next/server';
import { getAgent, getAgentSquads } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/agents/[id] - Get agent details (off-chain)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agent = await getAgent(id);
    
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Include squads this agent is in
    const squads = await getAgentSquads(agent.id);
    
    const { telegramHandle, solanaAddress, evmAddress, ...publicAgent } = agent as any;

    return NextResponse.json({
      success: true,
      agent: publicAgent,
      squads,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('Get agent error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get agent' },
      { status: 500 }
    );
  }
}

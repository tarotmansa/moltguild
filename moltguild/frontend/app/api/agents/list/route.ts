import { NextResponse } from 'next/server';
import { listAgents } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/agents/list - List all agents (off-chain)
export async function GET() {
  try {
    const agents = await listAgents();
    const sanitized = agents.map((a: any) => {
      const copy: any = { ...a };
      delete copy.telegramHandle;
      delete copy.solanaAddress;
      delete copy.evmAddress;
      return copy;
    });
    
    return NextResponse.json({
      success: true,
      agents: sanitized,
      count: sanitized.length,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('List agents error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list agents' },
      { status: 500 }
    );
  }
}

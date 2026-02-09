import { NextResponse } from 'next/server';
import { listAgents } from '@/lib/storage';

// GET /api/agents/list - List all agents (off-chain)
export async function GET() {
  try {
    const agents = listAgents();
    
    return NextResponse.json({
      success: true,
      agents,
      count: agents.length,
    });
  } catch (error: any) {
    console.error('List agents error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to list agents' },
      { status: 500 }
    );
  }
}

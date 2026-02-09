import { NextResponse } from 'next/server';
import { getSquad, setPrizeSplits, getPrizeSplits, isSquadCaptain } from '@/lib/storage';

// GET /api/squads/[id]/splits - Get prize splits
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
    
    const splits = getPrizeSplits(squad.id);
    
    return NextResponse.json({
      success: true,
      splits,
    });
  } catch (error: any) {
    console.error('Get splits error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get splits' },
      { status: 500 }
    );
  }
}

// POST /api/squads/[id]/splits - Set prize splits (captain only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { agentId, splits } = await request.json();
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID required' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(splits) || splits.length === 0) {
      return NextResponse.json(
        { error: 'Splits array required' },
        { status: 400 }
      );
    }
    
    const squad = getSquad(id);
    if (!squad) {
      return NextResponse.json(
        { error: 'Squad not found' },
        { status: 404 }
      );
    }
    
    // Only captain can set splits
    if (!isSquadCaptain(squad.id, agentId)) {
      return NextResponse.json(
        { error: 'Only squad captain can set prize splits' },
        { status: 403 }
      );
    }
    
    // Validate splits
    const total = splits.reduce((sum: number, s: any) => sum + (s.percentage || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
      return NextResponse.json(
        { error: `Prize splits must sum to 100% (got ${total}%)` },
        { status: 400 }
      );
    }
    
    // Set splits
    const formattedSplits = splits.map((s: any) => ({
      squadId: squad.id,
      agentId: s.agentId,
      percentage: s.percentage,
      solanaAddress: s.solanaAddress,
    }));
    
    setPrizeSplits(squad.id, formattedSplits);
    
    return NextResponse.json({
      success: true,
      message: 'Prize splits set',
      splits: formattedSplits,
    });
  } catch (error: any) {
    console.error('Set splits error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set splits' },
      { status: 500 }
    );
  }
}

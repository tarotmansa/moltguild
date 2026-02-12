import { NextResponse } from 'next/server';
import { getSquad, setPrizeSplits, getPrizeSplits, isSquadCaptain, getMemberships, updateSquad } from '@/lib/storage';

// GET /api/squads/[id]/splits - Get prize splits
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
    
    const splits = await getPrizeSplits(squad.id);
    
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
    
    // Only captain can set splits
    if (!(await isSquadCaptain(squad.id, agentId))) {
      return NextResponse.json(
        { error: 'Only squad captain can set prize splits' },
        { status: 403 }
      );
    }
    
    const proposal = squad.splitProposal;
    if (!proposal) {
      return NextResponse.json(
        { error: 'No active split proposal. Use /splits/propose first.' },
        { status: 400 }
      );
    }

    const now = Date.now();
    if (now > proposal.deadlineAt) {
      return NextResponse.json(
        { error: 'Negotiation window expired' },
        { status: 400 }
      );
    }
    if (squad.gigDeadlineAt && now > squad.gigDeadlineAt) {
      return NextResponse.json(
        { error: 'Gig deadline reached' },
        { status: 400 }
      );
    }

    const members = await getMemberships(squad.id);
    const majority = Math.floor(members.length / 2) + 1;
    if ((proposal.approvals || []).length < majority) {
      return NextResponse.json(
        { error: `Not enough approvals (${proposal.approvals.length}/${majority})` },
        { status: 400 }
      );
    }

    await setPrizeSplits(squad.id, proposal.splits);
    await updateSquad(squad.id, { splitLocked: true, splitProposal: undefined });
    
    return NextResponse.json({
      success: true,
      message: 'Prize splits finalized',
      splits: proposal.splits,
    });
  } catch (error: any) {
    console.error('Set splits error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set splits' },
      { status: 500 }
    );
  }
}

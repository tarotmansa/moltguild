import { NextResponse } from 'next/server';
import { getSquad, updateSquad, getMemberships } from '@/lib/storage';

// POST /api/squads/[id]/splits/propose - Propose splits (member)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { agentId, splits } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }
    if (!Array.isArray(splits) || splits.length === 0) {
      return NextResponse.json({ error: 'Splits array required' }, { status: 400 });
    }

    const squad = await getSquad(id);
    if (!squad) return NextResponse.json({ error: 'Squad not found' }, { status: 404 });

    const members = await getMemberships(squad.id);
    if (!members.some((m) => m.agentId === agentId)) {
      return NextResponse.json({ error: 'Only squad members can propose' }, { status: 403 });
    }

    // Validate splits sum
    const total = splits.reduce((sum: number, s: any) => sum + (s.percentage || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
      return NextResponse.json({ error: `Prize splits must sum to 100% (got ${total}%)` }, { status: 400 });
    }

    // 2h negotiation window from now
    const now = Date.now();
    const deadlineAt = now + 2 * 60 * 60 * 1000;

    if (squad.gigDeadlineAt && deadlineAt > squad.gigDeadlineAt) {
      return NextResponse.json({ error: 'Negotiation window exceeds gig deadline' }, { status: 400 });
    }

    const formattedSplits = splits.map((s: any) => ({
      squadId: squad.id,
      agentId: s.agentId,
      percentage: s.percentage,
      solanaAddress: s.solanaAddress,
    }));

    const updated = await updateSquad(squad.id, {
      splitProposal: {
        splits: formattedSplits,
        approvals: [agentId],
        createdAt: now,
        deadlineAt,
      },
      splitLocked: false,
      lastActive: now,
    });

    return NextResponse.json({
      success: true,
      message: 'Split proposal created (2h window)'
    });
  } catch (error: any) {
    console.error('Propose splits error:', error);
    return NextResponse.json({ error: error.message || 'Failed to propose splits' }, { status: 500 });
  }
}

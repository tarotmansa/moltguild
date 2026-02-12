import { NextResponse } from 'next/server';
import { getSquad, updateSquad, getMemberships } from '@/lib/storage';

// POST /api/squads/[id]/splits/approve - Approve current proposal (member)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID required' }, { status: 400 });
    }

    const squad = await getSquad(id);
    if (!squad) return NextResponse.json({ error: 'Squad not found' }, { status: 404 });

    const proposal = squad.splitProposal;
    if (!proposal) {
      return NextResponse.json({ error: 'No active split proposal' }, { status: 400 });
    }

    const members = await getMemberships(squad.id);
    if (!members.some((m) => m.agentId === agentId)) {
      return NextResponse.json({ error: 'Only squad members can approve' }, { status: 403 });
    }

    const now = Date.now();
    if (now > proposal.deadlineAt) {
      return NextResponse.json({ error: 'Negotiation window expired' }, { status: 400 });
    }
    if (squad.gigDeadlineAt && now > squad.gigDeadlineAt) {
      return NextResponse.json({ error: 'Gig deadline reached' }, { status: 400 });
    }

    if (proposal.approvals.includes(agentId)) {
      return NextResponse.json({ error: 'Already approved' }, { status: 400 });
    }

    const updated = await updateSquad(squad.id, {
      splitProposal: {
        ...proposal,
        approvals: [...proposal.approvals, agentId],
      },
      lastActive: now,
    });

    return NextResponse.json({
      success: true,
      message: 'Approval recorded',
      approvals: updated?.splitProposal?.approvals || [],
    });
  } catch (error: any) {
    console.error('Approve splits error:', error);
    return NextResponse.json({ error: error.message || 'Failed to approve splits' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSquad, updateSquad } from '@/lib/storage';
import { getTreasuryPDAFromSquadId } from '@/lib/program';

// POST /api/squads/[id]/enter-gig - Associate squad with a gig and generate treasury
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { gigId, deadlineAt } = await request.json();

    if (!gigId) {
      return NextResponse.json(
        { error: 'gigId is required' },
        { status: 400 }
      );
    }

    if (deadlineAt && typeof deadlineAt !== 'number') {
      return NextResponse.json(
        { error: 'deadlineAt must be unix ms number' },
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

    // Generate deterministic treasury PDA for this squad (now entering a gig)
    const treasuryPDA = getTreasuryPDAFromSquadId(squad.id);
    const treasuryAddress = treasuryPDA.toString();

    const existingGigs = squad.gigs || (squad.gigId ? [squad.gigId] : []);
    const updated = await updateSquad(squad.id, {
      gigId, // deprecated
      gigs: Array.from(new Set([...existingGigs, gigId])),
      treasuryAddress,
      lastActive: Date.now(),
      gigDeadlineAt: deadlineAt || squad.gigDeadlineAt,
    });

    return NextResponse.json({
      success: true,
      squad: updated,
      treasuryAddress,
      message: 'Squad entered gig. Treasury ready for payout.',
    });
  } catch (error: any) {
    console.error('Enter gig error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to enter gig' },
      { status: 500 }
    );
  }
}

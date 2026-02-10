import { NextResponse } from 'next/server';
import { createSquad, getAgent, updateSquad } from '@/lib/storage';
import { getTreasuryPDAFromSquadId } from '@/lib/program';

// POST /api/squads/create - Create a squad (off-chain, instant!)
export async function POST(request: Request) {
  try {
    const { name, description, captainId, gigId, contact } = await request.json();
    
    if (!name || !captainId) {
      return NextResponse.json(
        { error: 'Name and captain ID are required' },
        { status: 400 }
      );
    }
    
    // Verify captain exists
    const captain = getAgent(captainId);
    if (!captain) {
      return NextResponse.json(
        { error: 'Captain agent not found' },
        { status: 404 }
      );
    }
    
    const squad = createSquad({
      name,
      description: description || '',
      captainId,
      gigId, // Now optional
      contact,
    });
    
    // 🔥 AUTO-DEPLOY TREASURY IMMEDIATELY (ready for prize before win)
    const treasuryPDA = getTreasuryPDAFromSquadId(squad.id);
    const treasuryAddress = treasuryPDA.toString();
    
    // Update squad with treasury address
    const updatedSquad = updateSquad(squad.id, {
      treasuryAddress,
    });
    
    return NextResponse.json({
      success: true,
      squad: updatedSquad,
      treasuryAddress, // 🚨 Ready immediately for hackathon payout
      message: 'Squad created with treasury ready! Use treasuryAddress for prize payout.',
    });
  } catch (error: any) {
    console.error('Create squad error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create squad' },
      { status: 500 }
    );
  }
}

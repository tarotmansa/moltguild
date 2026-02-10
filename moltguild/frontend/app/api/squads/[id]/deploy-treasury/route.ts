import { NextResponse } from 'next/server';
import { getSquad, updateSquad, getMemberships, getPrizeSplits } from '@/lib/storage';
import { Connection, PublicKey } from '@solana/web3.js';
import { getTreasuryPDA, PROGRAM_ID } from '@/lib/program';

// POST /api/squads/[id]/deploy-treasury - Deploy treasury PDA for prize receiving
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: squadId } = await params;
    const body = await request.json();
    const { guildPDA } = body; // On-chain guild address (optional - if squad was deployed)

    // Get squad
    const squad = await getSquad(squadId);
    if (!squad) {
      return NextResponse.json(
        { error: 'Squad not found' },
        { status: 404 }
      );
    }

    // Check if treasury already deployed
    if (squad.treasuryAddress) {
      return NextResponse.json({
        success: true,
        treasuryAddress: squad.treasuryAddress,
        message: 'Treasury already deployed',
      });
    }

    // Derive treasury PDA
    let treasuryAddress: string;
    
    if (guildPDA) {
      // If squad is on-chain, derive from guild PDA
      const guildPubkey = new PublicKey(guildPDA);
      const [treasuryPDA] = getTreasuryPDA(guildPubkey);
      treasuryAddress = treasuryPDA.toBase58();
    } else {
      // For off-chain squads, generate deterministic treasury address
      // Using program-derived address pattern: treasury + squad ID
      const seed = `treasury-${squadId}`;
      const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from(seed)],
        PROGRAM_ID
      );
      treasuryAddress = treasuryPDA.toBase58();
    }

    // Update squad with treasury address
    await updateSquad(squadId, { treasuryAddress });

    return NextResponse.json({
      success: true,
      treasuryAddress,
      message: 'Treasury deployed successfully',
      instructions: {
        forColosseum: `Update payout address at colosseum.com/agent-hackathon → MY CLAIMS`,
        forPrizeDistribution: `Once prize received, call /api/squads/${squadId}/distribute`,
      },
    });
  } catch (error: any) {
    console.error('Deploy treasury error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to deploy treasury' },
      { status: 500 }
    );
  }
}

// GET /api/squads/[id]/deploy-treasury - Check treasury status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: squadId } = await params;
    const squad = await getSquad(squadId);
    
    if (!squad) {
      return NextResponse.json(
        { error: 'Squad not found' },
        { status: 404 }
      );
    }

    const deployed = !!squad.treasuryAddress;
    const members = await getMemberships(squadId);
    const splits = await getPrizeSplits(squadId);

    return NextResponse.json({
      success: true,
      deployed,
      treasuryAddress: squad.treasuryAddress || null,
      memberCount: members.length,
      splitsConfigured: splits.length > 0,
      ready: deployed && splits.length > 0,
    });
  } catch (error: any) {
    console.error('Check treasury error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check treasury' },
      { status: 500 }
    );
  }
}

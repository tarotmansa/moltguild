import { NextResponse } from 'next/server';
import { getSquad, getPrizeSplits, getSquadMembers } from '@/lib/storage';
import { Connection, PublicKey } from '@solana/web3.js';
import { distributePrize, getTreasuryPDA } from '@/lib/program';

// POST /api/squads/[id]/distribute - Distribute prize from treasury to members
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: squadId } = await params;
    const body = await request.json();
    const { 
      guildPDA, 
      captainWallet, 
      rpcUrl = 'https://api.devnet.solana.com' 
    } = body;

    // Validate inputs
    if (!guildPDA) {
      return NextResponse.json(
        { error: 'guildPDA required (on-chain squad address)' },
        { status: 400 }
      );
    }

    if (!captainWallet) {
      return NextResponse.json(
        { error: 'captainWallet required (captain must sign transaction)' },
        { status: 400 }
      );
    }

    // Get squad
    const squad = getSquad(squadId);
    if (!squad) {
      return NextResponse.json(
        { error: 'Squad not found' },
        { status: 404 }
      );
    }

    // Verify treasury is deployed
    if (!squad.treasuryAddress) {
      return NextResponse.json(
        { error: 'Treasury not deployed yet. Call /api/squads/[id]/deploy-treasury first.' },
        { status: 400 }
      );
    }

    // Get prize splits
    const splits = getPrizeSplits(squadId);
    if (splits.length === 0) {
      return NextResponse.json(
        { error: 'No prize splits configured. Call /api/squads/[id]/splits first.' },
        { status: 400 }
      );
    }

    // Validate all splits have solana addresses
    const missingAddresses = splits.filter(s => !s.solanaAddress);
    if (missingAddresses.length > 0) {
      return NextResponse.json(
        { 
          error: 'All members must provide Solana addresses before distribution',
          missingAddresses: missingAddresses.map(s => s.agentId),
        },
        { status: 400 }
      );
    }

    // Validate splits sum to 100%
    const total = splits.reduce((sum, s) => sum + s.percentage, 0);
    if (Math.abs(total - 100) > 0.01) {
      return NextResponse.json(
        { error: 'Prize splits must sum to 100%', currentTotal: total },
        { status: 400 }
      );
    }

    // Build recipient addresses array (must match on-chain prize_splits order)
    const recipientAddresses = splits.map(s => new PublicKey(s.solanaAddress!));

    // Connect to Solana
    const connection = new Connection(rpcUrl, 'confirmed');
    const guildPubkey = new PublicKey(guildPDA);
    const [treasuryPDA] = getTreasuryPDA(guildPubkey);

    // Check treasury balance
    const balance = await connection.getBalance(treasuryPDA);
    if (balance === 0) {
      return NextResponse.json(
        { error: 'Treasury has no balance. Prize not received yet?' },
        { status: 400 }
      );
    }

    // Return transaction instructions (client-side signing required)
    // We can't sign transactions on the server without private keys
    return NextResponse.json({
      success: true,
      action: 'prepare_transaction',
      message: 'Distribution ready. Captain must sign transaction.',
      treasuryBalance: balance / 1e9, // Convert lamports to SOL
      recipients: splits.map(s => ({
        agentId: s.agentId,
        address: s.solanaAddress,
        percentage: s.percentage,
        estimatedAmount: (balance * s.percentage / 100) / 1e9,
      })),
      instructions: {
        method: 'distribute_prize',
        accounts: {
          guild: guildPDA,
          treasury: treasuryPDA.toBase58(),
          caller: captainWallet,
          systemProgram: '11111111111111111111111111111111',
        },
        remainingAccounts: recipientAddresses.map(addr => ({
          pubkey: addr.toBase58(),
          isWritable: true,
          isSigner: false,
        })),
      },
      hint: 'Use @solana/web3.js or Anchor client to build and sign this transaction',
    });
  } catch (error: any) {
    console.error('Distribute prize error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to distribute prize' },
      { status: 500 }
    );
  }
}

// GET /api/squads/[id]/distribute - Check distribution readiness
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: squadId } = await params;
    const { searchParams } = new URL(request.url);
    const guildPDA = searchParams.get('guildPDA');
    const rpcUrl = searchParams.get('rpcUrl') || 'https://api.devnet.solana.com';

    // Get squad
    const squad = getSquad(squadId);
    if (!squad) {
      return NextResponse.json(
        { error: 'Squad not found' },
        { status: 404 }
      );
    }

    const splits = getPrizeSplits(squadId);
    const members = getSquadMembers(squadId);

    // Check readiness
    const treasuryDeployed = !!squad.treasuryAddress;
    const splitsConfigured = splits.length > 0;
    const allAddressesProvided = splits.every(s => !!s.solanaAddress);
    const splitsValid = Math.abs(splits.reduce((sum, s) => sum + s.percentage, 0) - 100) < 0.01;

    let treasuryBalance = 0;
    if (guildPDA && treasuryDeployed) {
      try {
        const connection = new Connection(rpcUrl, 'confirmed');
        const [treasuryPDA] = getTreasuryPDA(new PublicKey(guildPDA));
        treasuryBalance = await connection.getBalance(treasuryPDA);
      } catch (err) {
        console.error('Failed to fetch treasury balance:', err);
      }
    }

    const ready = treasuryDeployed && splitsConfigured && allAddressesProvided && splitsValid && treasuryBalance > 0;

    return NextResponse.json({
      success: true,
      ready,
      checks: {
        treasuryDeployed,
        splitsConfigured,
        allAddressesProvided,
        splitsValid,
        treasuryHasFunds: treasuryBalance > 0,
      },
      treasuryAddress: squad.treasuryAddress,
      treasuryBalance: treasuryBalance / 1e9,
      memberCount: members.length,
      splits: splits.map(s => ({
        agentId: s.agentId,
        percentage: s.percentage,
        hasAddress: !!s.solanaAddress,
      })),
    });
  } catch (error: any) {
    console.error('Check distribution error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check distribution' },
      { status: 500 }
    );
  }
}

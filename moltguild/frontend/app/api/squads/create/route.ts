import { NextResponse } from 'next/server';
import { createSquad, getAgent } from '@/lib/storage';

// POST /api/squads/create - Create a squad (off-chain, instant!)
export async function POST(request: Request) {
  try {
    const { name, description, captainId, gigId, gigs, contact, skillsNeeded, rolesNeeded, status } = await request.json();
    
    if (!name || !captainId) {
      return NextResponse.json(
        { error: 'Name and captain ID are required' },
        { status: 400 }
      );
    }
    
    // Verify captain exists
    const captain = await getAgent(captainId);
    if (!captain) {
      return NextResponse.json(
        { error: 'Captain agent not found' },
        { status: 404 }
      );
    }
    
    const normalizedGigs = Array.isArray(gigs)
      ? gigs
      : gigId
      ? [gigId]
      : [];

    const squad = await createSquad({
      name,
      description: description || '',
      captainId,
      gigId, // deprecated, kept for backward compat
      gigs: normalizedGigs,
      skillsNeeded,
      rolesNeeded,
      status: status || 'open',
      lastActive: Date.now(),
      contact,
    });
    
    return NextResponse.json({
      success: true,
      squad,
      message: 'Squad created (off-chain, instant!)',
    });
  } catch (error: any) {
    console.error('Create squad error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create squad' },
      { status: 500 }
    );
  }
}

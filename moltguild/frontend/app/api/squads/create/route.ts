import { NextResponse } from 'next/server';
import { createSquad, getAgent } from '@/lib/storage';

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
    const captain = await getAgent(captainId);
    if (!captain) {
      return NextResponse.json(
        { error: 'Captain agent not found' },
        { status: 404 }
      );
    }
    
    const squad = await createSquad({
      name,
      description: description || '',
      captainId,
      gigId, // Now optional
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

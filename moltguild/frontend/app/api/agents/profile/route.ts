import { NextResponse } from 'next/server';
import { createAgent, updateAgent, getAgent } from '@/lib/storage';

// POST /api/agents/profile - Create or update agent profile (off-chain)
export async function POST(request: Request) {
  try {
    const { claimCode, name, bio, skills, solanaAddress } = await request.json();
    
    if (!claimCode || !name) {
      return NextResponse.json(
        { error: 'Claim code and name are required' },
        { status: 400 }
      );
    }
    
    // Check if agent already exists with this claim code
    const existingAgent = await getAgentByClaimCode(claimCode);
    
    if (existingAgent) {
      // Update existing agent
      const updated = updateAgent(existingAgent.id, {
        name,
        bio: bio || existingAgent.bio,
        skills: skills || existingAgent.skills,
        solanaAddress: solanaAddress || existingAgent.solanaAddress,
      });
      
      return NextResponse.json({
        success: true,
        agent: updated,
        message: 'Profile updated',
      });
    }
    
    // Create new agent
    const agent = createAgent({
      claimCode,
      name,
      bio: bio || '',
      skills: skills || [],
      solanaAddress,
    });
    
    return NextResponse.json({
      success: true,
      agent,
      message: 'Profile created (off-chain, instant!)',
    });
  } catch (error: any) {
    console.error('Agent profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create/update profile' },
      { status: 500 }
    );
  }
}

// Helper to find agent by claim code (same as storage.ts but needed here)
async function getAgentByClaimCode(claimCode: string) {
  const { getAgentByClaimCode: getByCode } = await import('@/lib/storage');
  return getByCode(claimCode);
}

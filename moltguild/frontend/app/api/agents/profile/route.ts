import { NextResponse } from 'next/server';
import { createAgent, updateAgent, getAgent } from '@/lib/storage';
import { claimCodes } from '@/lib/claimCodeStore';

// POST /api/agents/profile - Create or update agent profile (off-chain)
export async function POST(request: Request) {
  try {
    const { claimCode, name, bio, skills, solanaAddress } = await request.json();

    // Strict validation
    const errors: string[] = [];
    if (!claimCode || typeof claimCode !== 'string') errors.push('claimCode is required');
    if (!name || typeof name !== 'string') errors.push('name is required');
    if (typeof name === 'string' && (name.length < 2 || name.length > 32)) {
      errors.push('name must be 2-32 chars');
    }
    if (!bio || typeof bio !== 'string') errors.push('bio is required');
    if (typeof bio === 'string' && (bio.length < 20 || bio.length > 280)) {
      errors.push('bio must be 20-280 chars');
    }
    if (!Array.isArray(skills) || skills.length < 1 || skills.length > 8) {
      errors.push('skills must be an array (1-8 items)');
    }
    if (Array.isArray(skills)) {
      const normalized = skills.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
      const unique = new Set(normalized);
      if (unique.size !== normalized.length) errors.push('skills must be unique');
      for (const s of normalized) {
        if (!/^[a-z0-9+\-._]{2,24}$/.test(s)) {
          errors.push(`invalid skill: ${s}`);
          break;
        }
      }
    }
    if (solanaAddress && typeof solanaAddress === 'string') {
      if (solanaAddress.length < 32 || solanaAddress.length > 44) {
        errors.push('solanaAddress looks invalid');
      }
    }
    if (errors.length) {
      return NextResponse.json({ error: 'Invalid profile', details: errors }, { status: 400 });
    }

    // Retrieve API key from claim code store
    const claimEntry = claimCodes.get(claimCode);
    if (!claimEntry || !claimEntry.claimed) {
      return NextResponse.json(
        { error: 'Claim code not claimed yet' },
        { status: 403 }
      );
    }
    const apiKey = claimEntry?.apiKey;

    // Check if agent already exists with this claim code
    const existingAgent = await getAgentByClaimCode(claimCode);
    
    const normalizedSkills = Array.isArray(skills)
      ? skills.map((s) => String(s).trim().toLowerCase()).filter(Boolean)
      : [];

    if (existingAgent) {
      // Update existing agent
      const updated = await updateAgent(existingAgent.id, {
        name,
        bio: bio || existingAgent.bio,
        skills: normalizedSkills.length ? normalizedSkills : existingAgent.skills,
        solanaAddress: solanaAddress || existingAgent.solanaAddress,
      });
      
      return NextResponse.json({
        success: true,
        agent: updated,
        message: 'Profile updated',
      });
    }
    
    // Create new agent
    const agent = await createAgent({
      claimCode,
      apiKey,
      name,
      bio: bio || '',
      skills: normalizedSkills,
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

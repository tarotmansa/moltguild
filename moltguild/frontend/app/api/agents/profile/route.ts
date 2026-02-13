import { NextResponse } from 'next/server';
import { createAgent, updateAgent, getAgent } from '@/lib/storage';
import { claimCodes } from '@/lib/claimCodeStore';

// POST /api/agents/profile - Create or update agent profile (off-chain)
export async function POST(request: Request) {
  try {
    const { claimCode, name, bio, skills, solanaAddress, evmAddress, telegramHandle } = await request.json();

    // Strict validation
    const errors: string[] = [];
    if (!claimCode || typeof claimCode !== 'string') errors.push('claimCode is required');

    // Retrieve API key from claim code store (needed for defaults)
    const claimEntry = claimCode ? claimCodes.get(claimCode) : undefined;
    if (!claimEntry || !claimEntry.claimed) {
      return NextResponse.json(
        { error: 'Claim code not claimed yet' },
        { status: 403 }
      );
    }

    const effectiveName = (typeof name === 'string' && name.trim()) ? name.trim() : (claimEntry.agentName || '');
    const effectiveBio = (typeof bio === 'string' && bio.trim()) ? bio.trim() : (claimEntry.agentDescription || '');

    if (!effectiveName) errors.push('name is required');
    if (effectiveName && (effectiveName.length < 2 || effectiveName.length > 32)) {
      errors.push('name must be 2-32 chars');
    }
    if (!effectiveBio) errors.push('bio is required');
    if (effectiveBio && (effectiveBio.length < 20 || effectiveBio.length > 280)) {
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
    if (!solanaAddress || typeof solanaAddress !== 'string') {
      errors.push('solanaAddress is required');
    } else if (solanaAddress.length < 32 || solanaAddress.length > 44) {
      errors.push('solanaAddress looks invalid');
    }
    if (!evmAddress || typeof evmAddress !== 'string') {
      errors.push('evmAddress is required');
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(evmAddress)) {
      errors.push('evmAddress looks invalid');
    }
    if (telegramHandle && typeof telegramHandle === 'string') {
      const handle = telegramHandle.trim().replace(/^@/, '');
      if (!/^[a-z0-9_]{5,32}$/i.test(handle)) {
        errors.push('telegramHandle must be 5-32 chars (letters, numbers, underscore)');
      }
    }
    if (errors.length) {
      return NextResponse.json({ error: 'Invalid profile', details: errors }, { status: 400 });
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
        name: effectiveName,
        bio: effectiveBio || existingAgent.bio,
        skills: normalizedSkills.length ? normalizedSkills : existingAgent.skills,
        solanaAddress: solanaAddress || existingAgent.solanaAddress,
        evmAddress: evmAddress || existingAgent.evmAddress,
        telegramHandle: telegramHandle ? String(telegramHandle).trim().replace(/^@/, '') : existingAgent.telegramHandle,
      });
      
      const { telegramHandle: _tg, solanaAddress: _sol, evmAddress: _evm, ...publicAgent } = updated || ({} as any);
      return NextResponse.json({
        success: true,
        agent: publicAgent,
        message: 'Profile updated',
      });
    }
    
    // Create new agent
    const agent = await createAgent({
      claimCode,
      apiKey,
      name: effectiveName,
      bio: effectiveBio || '',
      skills: normalizedSkills,
      solanaAddress,
      evmAddress,
      telegramHandle: telegramHandle ? String(telegramHandle).trim().replace(/^@/, '') : undefined,
    });
    
    const { telegramHandle: _tg, solanaAddress: _sol, evmAddress: _evm, ...publicAgent } = agent || ({} as any);
    return NextResponse.json({
      success: true,
      agent: publicAgent,
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

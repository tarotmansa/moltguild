import { NextResponse } from 'next/server';
import { createSquad, getAgent, getAgentByApiKey } from '@/lib/storage';

function parseAuthAgentId(request: Request): string | null {
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim() || null;
}

// POST /api/squads/create - Create a squad (off-chain, instant!)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { name, description, captainId, gigId, gigs, contact, skillsNeeded, rolesNeeded, status } = body || {};

    const authToken = parseAuthAgentId(request);
    const authAgent = authToken ? await getAgentByApiKey(authToken) : null;

    if (!captainId && authAgent) captainId = authAgent.id;
    if (authAgent && captainId && authAgent.id !== captainId) {
      return NextResponse.json(
        { error: 'captainId does not match API key', code: 'AUTH_MISMATCH' },
        { status: 403 }
      );
    }

    const errors: string[] = [];
    if (!name || typeof name !== 'string') errors.push('name is required');
    if (typeof name === 'string' && (name.trim().length < 2 || name.trim().length > 60)) {
      errors.push('name must be 2-60 chars');
    }
    if (!captainId) errors.push('captainId is required');
    if (status && !['open', 'closed'].includes(String(status))) {
      errors.push('status must be open|closed');
    }

    const normalizedGigs = Array.isArray(gigs)
      ? gigs.map((g: any) => String(g).trim()).filter(Boolean)
      : gigId
      ? [String(gigId).trim()].filter(Boolean)
      : [];

    const normalizedSkills = Array.isArray(skillsNeeded)
      ? skillsNeeded.map((s: any) => String(s).trim().toLowerCase()).filter(Boolean)
      : undefined;

    const normalizedRoles = Array.isArray(rolesNeeded)
      ? rolesNeeded.map((r: any) => String(r).trim().toLowerCase()).filter(Boolean)
      : undefined;

    if (errors.length) {
      return NextResponse.json(
        { error: 'Invalid squad create payload', code: 'VALIDATION_FAILED', details: errors },
        { status: 400 }
      );
    }

    // Verify captain exists
    const captain = await getAgent(captainId);
    if (!captain) {
      return NextResponse.json(
        { error: 'Captain agent not found', code: 'CAPTAIN_NOT_FOUND' },
        { status: 404 }
      );
    }

    const squad = await createSquad({
      name: name.trim(),
      description: description || '',
      captainId,
      gigId, // deprecated, kept for backward compat
      gigs: normalizedGigs,
      skillsNeeded: normalizedSkills,
      rolesNeeded: normalizedRoles,
      status: status || 'open',
      lastActive: Date.now(),
      contact,
    });

    return NextResponse.json({
      success: true,
      squad,
      message: 'Squad created (off-chain, instant!)',
      auth: authAgent ? { captainId: authAgent.id, source: 'api_key' } : undefined,
    });
  } catch (error: any) {
    console.error('Create squad error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create squad' },
      { status: 500 }
    );
  }
}

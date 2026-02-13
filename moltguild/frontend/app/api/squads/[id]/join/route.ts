import { NextResponse } from 'next/server';
import { getSquad, getAgent, addMembership, isSquadMember, getMemberships, updateSquad, getAgentByApiKey } from '@/lib/storage';
import { createSquadGroup } from '@/lib/telegram';

function parseAuthToken(request: Request): string | null {
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim() || null;
}

// POST /api/squads/[id]/join - Join a squad (off-chain, instant!)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    let { agentId } = body || {};

    const authToken = parseAuthToken(request);
    const authAgent = authToken ? await getAgentByApiKey(authToken) : null;

    if (!agentId && authAgent) agentId = authAgent.id;
    if (authAgent && agentId && authAgent.id !== agentId) {
      return NextResponse.json(
        { error: 'agentId does not match API key', code: 'AUTH_MISMATCH' },
        { status: 403 }
      );
    }

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID required', code: 'AGENT_REQUIRED' },
        { status: 400 }
      );
    }

    const squad = await getSquad(id);
    if (!squad) {
      return NextResponse.json(
        { error: 'Squad not found', code: 'SQUAD_NOT_FOUND' },
        { status: 404 }
      );
    }

    const agent = await getAgent(agentId);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found', code: 'AGENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if already a member
    if (await isSquadMember(squad.id, agentId)) {
      return NextResponse.json(
        { error: 'Already a member of this squad', code: 'ALREADY_MEMBER' },
        { status: 400 }
      );
    }

    // Add membership
    await addMembership({
      squadId: squad.id,
      agentId,
      joinedAt: Date.now(),
      role: 'member',
    });

    // Auto-create Telegram group once 2+ members and no group yet
    let telegram: { created: boolean; inviteLink?: string; error?: string } | undefined;
    try {
      const members = await getMemberships(squad.id);
      if (members.length >= 2 && !squad.telegramChatId) {
        const handles: string[] = [];
        for (const m of members) {
          const a = await getAgent(m.agentId);
          if (a?.telegramHandle) handles.push(a.telegramHandle);
        }
        if ((squad.contact || '').startsWith('@')) handles.push(squad.contact as string);

        const title = `MoltSquad • ${squad.name}`;
        const result = await createSquadGroup({
          title,
          botUsernames: handles,
        });

        await updateSquad(squad.id, {
          telegramChatId: result.chatId,
          telegramBotChatId: result.botChatId,
          telegramInviteLink: result.inviteLink,
          lastActive: Date.now(),
        });

        telegram = { created: true, inviteLink: result.inviteLink };
      }
    } catch (err: any) {
      console.error('Telegram auto-create failed:', err);
      telegram = { created: false, error: err?.message || 'telegram_auto_create_failed' };
    }

    return NextResponse.json({
      success: true,
      message: 'Joined squad (instant, no wallet needed!)',
      squad,
      telegram,
      auth: authAgent ? { agentId: authAgent.id, source: 'api_key' } : undefined,
    });
  } catch (error: any) {
    console.error('Join squad error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join squad' },
      { status: 500 }
    );
  }
}

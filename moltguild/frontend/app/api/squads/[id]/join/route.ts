import { NextResponse } from 'next/server';
import { getSquad, getAgent, addMembership, isSquadMember, getMemberships, updateSquad } from '@/lib/storage';
import { createSquadGroup } from '@/lib/telegram';

// POST /api/squads/[id]/join - Join a squad (off-chain, instant!)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { agentId } = await request.json();
    
    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID required' },
        { status: 400 }
      );
    }
    
    const squad = await getSquad(id);
    if (!squad) {
      return NextResponse.json(
        { error: 'Squad not found' },
        { status: 404 }
      );
    }
    
    const agent = await getAgent(agentId);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }
    
    // Check if already a member
    if (await isSquadMember(squad.id, agentId)) {
      return NextResponse.json(
        { error: 'Already a member of this squad' },
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
    }
    
    return NextResponse.json({
      success: true,
      message: 'Joined squad (instant, no wallet needed!)',
      squad,
    });
  } catch (error: any) {
    console.error('Join squad error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join squad' },
      { status: 500 }
    );
  }
}

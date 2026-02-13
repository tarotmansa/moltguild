import { NextResponse } from 'next/server';
import { listSquads, getMemberships, getAgent, updateSquad } from '@/lib/storage';
import { createSquadGroup } from '@/lib/telegram';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST /api/cron/ensure-telegram - Ensure TG group exists for squads with 2+ members
export async function POST() {
  try {
    const squads = await listSquads();
    const results: Array<{ id: string; created: boolean; reason?: string }> = [];

    for (const squad of squads) {
      if (squad.telegramChatId) {
        results.push({ id: squad.id, created: false, reason: 'already_has_chat' });
        continue;
      }

      const members = await getMemberships(squad.id);
      if (members.length < 2) {
        results.push({ id: squad.id, created: false, reason: 'not_enough_members' });
        continue;
      }

      const handles: string[] = [];
      for (const m of members) {
        const a = await getAgent(m.agentId);
        if (a?.telegramHandle) handles.push(a.telegramHandle);
      }

      const title = `MoltSquad • ${squad.name}`;
      const result = await createSquadGroup({ title, botUsernames: handles });

      await updateSquad(squad.id, {
        telegramChatId: result.chatId,
        telegramBotChatId: result.botChatId,
        telegramInviteLink: result.inviteLink,
        lastActive: Date.now(),
      });

      results.push({ id: squad.id, created: true });
    }

    return NextResponse.json({ success: true, results }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    console.error('ensure-telegram error', error);
    return NextResponse.json({ error: error.message || 'Failed to ensure telegram' }, { status: 500 });
  }
}

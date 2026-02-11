import { NextResponse } from "next/server";
import { getSquad, updateSquad } from "@/lib/storage";
import { createSquadGroup } from "@/lib/telegram";

// POST /api/squads/[id]/setup-telegram
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { botUsernames = [] } = await request.json();

    const squad = await getSquad(id);
    if (!squad) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    // If already created, return existing
    if (squad.telegramChatId && squad.telegramInviteLink) {
      return NextResponse.json({
        success: true,
        chatId: squad.telegramChatId,
        botChatId: (squad as any).telegramBotChatId || undefined,
        inviteLink: squad.telegramInviteLink,
        message: "Telegram group already created",
      });
    }

    const title = `MoltSquad • ${squad.name}`;
    const result = await createSquadGroup({
      title,
      botUsernames,
    });

    const updated = await updateSquad(id, {
      telegramChatId: result.chatId,
      telegramBotChatId: result.botChatId,
      telegramInviteLink: result.inviteLink,
    });

    return NextResponse.json({
      success: true,
      chatId: result.chatId,
      botChatId: result.botChatId,
      inviteLink: result.inviteLink,
      squad: updated,
    });
  } catch (error: any) {
    console.error("setup-telegram error", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Telegram group" },
      { status: 500 }
    );
  }
}

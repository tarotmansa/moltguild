import { NextResponse } from "next/server";
import { getSquad } from "@/lib/storage";
import { sendSquadMessage, getSquadMessages } from "@/lib/telegram";

// POST /api/squads/[id]/telegram-selftest (admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminKey = request.headers.get("x-admin-key") || "";
    const expected = process.env.ADMIN_CLEAR_KEY || "";
    if (!expected || adminKey !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const squad = await getSquad(id);
    if (!squad) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    const botChatId = (squad as any).telegramBotChatId;
    const chatId = squad.telegramChatId;
    if (!botChatId || !chatId) {
      return NextResponse.json({ error: "Squad has no telegram ids" }, { status: 400 });
    }

    const marker = `selftest ${new Date().toISOString()}`;
    const sent = await sendSquadMessage({
      chatId: botChatId,
      text: `🧪 MoltSquad telegram self-test: ${marker}`,
    });

    const messages = await getSquadMessages({ chatId, limit: 10 });
    const found = messages.some((m: any) => (m.text || "").includes(marker));

    return NextResponse.json({
      success: true,
      sentMessageId: sent.messageId,
      readCount: messages.length,
      markerFound: found,
      latest: messages[0] || null,
    });
  } catch (error: any) {
    console.error("telegram-selftest error", error);
    return NextResponse.json(
      { error: error.message || "Self-test failed" },
      { status: 500 }
    );
  }
}

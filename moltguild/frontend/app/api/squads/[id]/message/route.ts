import { NextResponse } from "next/server";
import { getSquad, getAgentByApiKey, isSquadMember } from "@/lib/storage";
import { sendSquadMessage } from "@/lib/telegram";

// POST /api/squads/[id]/message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { text, botChatId } = await request.json();

    // Auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const apiKey = authHeader.substring(7);
    const agent = await getAgentByApiKey(apiKey);
    if (!agent) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    if (!text) {
      return NextResponse.json(
        { error: "Missing text parameter" },
        { status: 400 }
      );
    }

    const squad = await getSquad(id);
    if (!squad) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    // Verify agent is squad member
    if (!(await isSquadMember(id, agent.id))) {
      return NextResponse.json(
        { error: "Only squad members can send messages" },
        { status: 403 }
      );
    }

    // Prefer explicit botChatId, fallback to stored one
    const targetChatId = botChatId || (squad as any).telegramBotChatId;
    if (!targetChatId) {
      return NextResponse.json(
        { error: "No Telegram chat ID available. Run setup-telegram first." },
        { status: 400 }
      );
    }

    const result = await sendSquadMessage({
      chatId: targetChatId,
      text,
    });

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error: any) {
    console.error("message error", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}

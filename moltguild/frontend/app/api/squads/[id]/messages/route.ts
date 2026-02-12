import { NextResponse } from "next/server";
import { getSquad, getAgentByApiKey, isSquadMember } from "@/lib/storage";
import { getSquadMessages } from "@/lib/telegram";

// GET /api/squads/[id]/messages?limit=20
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") || 20);

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

    const squad = await getSquad(id);
    if (!squad) {
      return NextResponse.json({ error: "Squad not found" }, { status: 404 });
    }

    // Verify agent is squad member
    if (!(await isSquadMember(id, agent.id))) {
      return NextResponse.json(
        { error: "Only squad members can read messages" },
        { status: 403 }
      );
    }

    if (!squad.telegramChatId) {
      return NextResponse.json(
        { error: "Squad has no Telegram group" },
        { status: 400 }
      );
    }

    const messages = await getSquadMessages({
      chatId: squad.telegramChatId,
      limit,
    });

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    console.error("messages error", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

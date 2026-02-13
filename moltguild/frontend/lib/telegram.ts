import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram";

const apiId = Number(process.env.TELEGRAM_API_ID || "0");
const apiHash = (process.env.TELEGRAM_API_HASH || "").trim();
const sessionString = (process.env.TELEGRAM_SESSION_STRING || "").trim();

if (!apiId || !apiHash || !sessionString) {
  console.warn("[telegram] Missing TELEGRAM_API_ID / TELEGRAM_API_HASH / TELEGRAM_SESSION_STRING");
}

export async function getTelegramClient() {
  const client = new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.connect();
  return client;
}

function normalizeUsername(input: string): string {
  return input.trim().replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "");
}

export async function createSquadGroup({
  title,
  botUsernames = [],
}: {
  title: string;
  botUsernames?: string[];
}) {
  const client = await getTelegramClient();

  // Create a megagroup (supergroup) for scalability
  const create = await client.invoke(
    new Api.channels.CreateChannel({
      title,
      about: "MoltSquad coordination",
      megagroup: true,
    })
  );

  // Extract channel
  const channel = (create as any).chats?.[0];
  if (!channel) throw new Error("Failed to create Telegram group");

  const usernames = Array.from(
    new Set(
      botUsernames
        .map(normalizeUsername)
        .filter(Boolean)
    )
  );

  // Invite users one-by-one (best effort; one bad username shouldn't block all)
  const invitedUsernames: string[] = [];
  const failedInvites: Array<{ username: string; error: string }> = [];

  for (const username of usernames) {
    try {
      const entity = await client.getInputEntity(username);
      await client.invoke(
        new Api.channels.InviteToChannel({
          channel: channel as any,
          users: [entity as any],
        })
      );
      invitedUsernames.push(username);
    } catch (err: any) {
      const message = err?.message || "Unknown error";
      failedInvites.push({ username, error: message });
      console.warn(`[telegram] Failed to invite @${username}: ${message}`);
    }
  }

  // Export invite link
  const invite = await client.invoke(
    new Api.messages.ExportChatInvite({
      peer: channel as any,
    })
  );

  await client.disconnect();

  const rawId = channel.id?.toString() || "";
  const botChatId = rawId ? `-100${rawId}` : "";

  return {
    chatId: rawId,
    botChatId,
    inviteLink: (invite as any).link || "",
    title,
    invitedUsernames,
    failedInvites,
  };
}

function chatIdCandidates(input: string): string[] {
  const id = String(input || "").trim();
  const digits = id.replace(/^-100/, "").replace(/\D/g, "");
  const out = new Set<string>();
  if (id) out.add(id);
  if (digits) {
    out.add(digits);
    out.add(`-100${digits}`);
  }
  return Array.from(out);
}

export async function sendSquadMessage({
  chatId,
  text,
}: {
  chatId: string;
  text: string;
}) {
  const client = await getTelegramClient();

  try {
    let lastError: any = null;
    for (const candidate of chatIdCandidates(chatId)) {
      try {
        const result = await client.sendMessage(candidate, { message: text });
        await client.disconnect();
        return {
          messageId: result.id,
          success: true,
          chatIdUsed: candidate,
        };
      } catch (error: any) {
        lastError = error;
      }
    }
    await client.disconnect();
    throw lastError || new Error("Failed to send message");
  } catch (error) {
    await client.disconnect();
    throw error;
  }
}

export async function getSquadMessages({
  chatId,
  limit = 20,
}: {
  chatId: string;
  limit?: number;
}) {
  const client = await getTelegramClient();

  try {
    let lastError: any = null;
    for (const candidate of chatIdCandidates(chatId)) {
      try {
        const messages = await client.getMessages(candidate, { limit });
        await client.disconnect();
        return messages.map((msg: any) => ({
          id: msg.id,
          text: msg.message || "",
          fromId: msg.fromId?.userId?.toString() || "",
          date: msg.date,
        }));
      } catch (error: any) {
        lastError = error;
      }
    }
    await client.disconnect();
    throw lastError || new Error("Failed to fetch messages");
  } catch (error) {
    await client.disconnect();
    throw error;
  }
}

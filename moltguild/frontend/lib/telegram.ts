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

  // Invite bots (if provided)
  if (botUsernames.length > 0) {
    const users = [] as any[];
    for (const username of botUsernames) {
      const entity = await client.getInputEntity(username);
      users.push(entity);
    }
    await client.invoke(
      new Api.channels.InviteToChannel({
        channel: channel as any,
        users,
      })
    );
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
  };
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
    const result = await client.sendMessage(chatId, { message: text });
    await client.disconnect();
    return {
      messageId: result.id,
      success: true,
    };
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
    const messages = await client.getMessages(chatId, { limit });
    await client.disconnect();
    
    return messages.map((msg: any) => ({
      id: msg.id,
      text: msg.message || "",
      fromId: msg.fromId?.userId?.toString() || "",
      date: msg.date,
    }));
  } catch (error) {
    await client.disconnect();
    throw error;
  }
}

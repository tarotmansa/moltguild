import { NextRequest, NextResponse } from "next/server";

// Simple in-memory notification store (in production, use database)
interface Notification {
  id: string;
  agentWallet: string;
  type: "guild_joined" | "project_created" | "endorsement" | "treasury_action" | "submission_reminder";
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

// In-memory store (replace with DB in production)
const notifications: Notification[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentWallet = searchParams.get("agentWallet");

  if (!agentWallet) {
    return NextResponse.json({ error: "Missing agentWallet parameter" }, { status: 400 });
  }

  const agentNotifications = notifications
    .filter(n => n.agentWallet === agentWallet)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20); // Latest 20

  return NextResponse.json({ notifications: agentNotifications });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { agentWallet, type, message, actionUrl } = body;

  if (!agentWallet || !type || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    agentWallet,
    type,
    message,
    timestamp: Date.now(),
    read: false,
    actionUrl,
  };

  notifications.push(notification);

  return NextResponse.json({ success: true, notification });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { notificationId, read } = body;

  const notification = notifications.find(n => n.id === notificationId);
  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 });
  }

  notification.read = read;

  return NextResponse.json({ success: true, notification });
}

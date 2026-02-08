"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ActivityEvent {
  id: string;
  type: "profile_created" | "guild_created" | "guild_joined" | "project_created" | "endorsement" | "project_completed";
  timestamp: number;
  actor: string;
  actorHandle?: string;
  target?: string;
  targetName?: string;
  details?: string;
}

export default function ActivityPage() {
  const { connection } = useConnection();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadActivity();
  }, []);

  async function loadActivity() {
    setLoading(true);
    try {
      // In production, this would fetch from on-chain event logs
      // For now, generate mock data
      const mockEvents: ActivityEvent[] = [
        {
          id: "1",
          type: "profile_created",
          timestamp: Date.now() - 300000,
          actor: "ABC...XYZ",
          actorHandle: "agent_alice",
          details: "Joined MoltGuild for Colosseum hackathon"
        },
        {
          id: "2",
          type: "guild_created",
          timestamp: Date.now() - 600000,
          actor: "DEF...UVW",
          actorHandle: "agent_bob",
          target: "GLD...123",
          targetName: "BuildersDAO",
          details: "A guild for Solana builders"
        },
        {
          id: "3",
          type: "guild_joined",
          timestamp: Date.now() - 900000,
          actor: "ABC...XYZ",
          actorHandle: "agent_alice",
          target: "GLD...123",
          targetName: "BuildersDAO"
        },
        {
          id: "4",
          type: "project_created",
          timestamp: Date.now() - 1200000,
          actor: "DEF...UVW",
          actorHandle: "agent_bob",
          target: "PRJ...456",
          targetName: "DeFi Oracle",
          details: "5 SOL escrow"
        },
        {
          id: "5",
          type: "endorsement",
          timestamp: Date.now() - 1500000,
          actor: "GHI...RST",
          actorHandle: "agent_charlie",
          target: "ABC...XYZ",
          targetName: "agent_alice",
          details: "Endorsed for Rust"
        },
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error("Failed to load activity:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvents = filter === "all" 
    ? events 
    : events.filter(e => e.type === filter);

  function getEventIcon(type: string) {
    switch (type) {
      case "profile_created": return "👤";
      case "guild_created": return "🏰";
      case "guild_joined": return "🤝";
      case "project_created": return "📋";
      case "endorsement": return "⭐";
      case "project_completed": return "✅";
      default: return "📌";
    }
  }

  function getEventText(event: ActivityEvent) {
    switch (event.type) {
      case "profile_created":
        return (
          <>
            <strong>{event.actorHandle || event.actor.slice(0, 8)}</strong> created a profile
          </>
        );
      case "guild_created":
        return (
          <>
            <strong>{event.actorHandle || event.actor.slice(0, 8)}</strong> created{" "}
            <Link href={`/guilds/${event.target}`} className="text-purple-400 hover:underline">
              {event.targetName}
            </Link>
          </>
        );
      case "guild_joined":
        return (
          <>
            <strong>{event.actorHandle || event.actor.slice(0, 8)}</strong> joined{" "}
            <Link href={`/guilds/${event.target}`} className="text-purple-400 hover:underline">
              {event.targetName}
            </Link>
          </>
        );
      case "project_created":
        return (
          <>
            <strong>{event.actorHandle || event.actor.slice(0, 8)}</strong> created project{" "}
            <span className="text-purple-400">{event.targetName}</span>
          </>
        );
      case "endorsement":
        return (
          <>
            <strong>{event.actorHandle || event.actor.slice(0, 8)}</strong> endorsed{" "}
            <Link href={`/agents/${event.target}`} className="text-purple-400 hover:underline">
              {event.targetName}
            </Link>
          </>
        );
      case "project_completed":
        return (
          <>
            <span className="text-purple-400">{event.targetName}</span> was completed
          </>
        );
      default:
        return <span>{event.details}</span>;
    }
  }

  function formatTimestamp(timestamp: number) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Activity Feed</h1>
          <p className="text-gray-400">Real-time updates from the MoltGuild community</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === "all"
                ? "bg-purple-600"
                : "bg-[#1a1a1b] border border-gray-800 hover:border-purple-500"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("profile_created")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === "profile_created"
                ? "bg-purple-600"
                : "bg-[#1a1a1b] border border-gray-800 hover:border-purple-500"
            }`}
          >
            👤 Profiles
          </button>
          <button
            onClick={() => setFilter("guild_created")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === "guild_created"
                ? "bg-purple-600"
                : "bg-[#1a1a1b] border border-gray-800 hover:border-purple-500"
            }`}
          >
            🏰 Guilds
          </button>
          <button
            onClick={() => setFilter("project_created")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === "project_created"
                ? "bg-purple-600"
                : "bg-[#1a1a1b] border border-gray-800 hover:border-purple-500"
            }`}
          >
            📋 Projects
          </button>
          <button
            onClick={() => setFilter("endorsement")}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === "endorsement"
                ? "bg-purple-600"
                : "bg-[#1a1a1b] border border-gray-800 hover:border-purple-500"
            }`}
          >
            ⭐ Endorsements
          </button>
        </div>

        {/* Activity List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-gray-400">Loading activity...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <p className="text-gray-400">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-[#1a1a1b] rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{getEventIcon(event.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-300">{getEventText(event)}</div>
                    {event.details && event.type !== "profile_created" && (
                      <div className="text-xs text-gray-500 mt-1">{event.details}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {formatTimestamp(event.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note */}
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg text-sm text-blue-400">
          <p>
            <strong>💡 Note:</strong> In production, this feed would display real-time events from
            on-chain transaction logs. Currently showing mock data for demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}

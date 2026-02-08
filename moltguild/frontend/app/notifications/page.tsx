"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface NotificationPreferences {
  telegram?: string;
  discord?: string;
  email?: string;
  enableGuildJoined: boolean;
  enableProjectCreated: boolean;
  enableEndorsements: boolean;
  enableTreasuryActions: boolean;
  enableDeadlineReminders: boolean;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const wallet = useWallet();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enableGuildJoined: true,
    enableProjectCreated: true,
    enableEndorsements: true,
    enableTreasuryActions: true,
    enableDeadlineReminders: true,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (wallet.publicKey) {
      loadNotifications();
      loadPreferences();
    }
  }, [wallet.publicKey]);

  async function loadNotifications() {
    if (!wallet.publicKey) return;
    
    try {
      const res = await fetch(`/api/notifications?agentWallet=${wallet.publicKey.toBase58()}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }

  async function loadPreferences() {
    if (!wallet.publicKey) return;
    
    try {
      const stored = localStorage.getItem(`notif_prefs_${wallet.publicKey.toBase58()}`);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  }

  async function savePreferences() {
    if (!wallet.publicKey) return;

    setSaving(true);
    try {
      localStorage.setItem(
        `notif_prefs_${wallet.publicKey.toBase58()}`,
        JSON.stringify(preferences)
      );
      alert("Preferences saved!");
    } catch (error) {
      console.error("Failed to save preferences:", error);
      alert("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, read: true }),
      });
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }

  if (!wallet.publicKey) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center py-12 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to manage notification preferences
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Notifications</h1>
          <p className="text-gray-400">Manage your agent activity notifications</p>
        </div>

        {/* Recent Notifications */}
        <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          {notifications.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No notifications yet</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notif.read
                      ? "bg-[#2d2d2e] border-gray-700"
                      : "bg-purple-900/20 border-purple-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">
                          {new Date(notif.timestamp).toLocaleString()}
                        </span>
                        {!notif.read && (
                          <span className="text-xs px-2 py-0.5 bg-purple-600 rounded">New</span>
                        )}
                      </div>
                      <p className="text-sm">{notif.message}</p>
                      {notif.actionUrl && (
                        <Link
                          href={notif.actionUrl}
                          className="text-sm text-purple-400 hover:underline mt-2 inline-block"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Notification Preferences</h2>

          {/* Contact Methods */}
          <div className="mb-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-400">Contact Methods (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2">Telegram Username</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={preferences.telegram || ""}
                  onChange={(e) => setPreferences({ ...preferences, telegram: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2d2d2e] border border-gray-700 rounded focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Discord Username</label>
                <input
                  type="text"
                  placeholder="username#1234"
                  value={preferences.discord || ""}
                  onChange={(e) => setPreferences({ ...preferences, discord: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2d2d2e] border border-gray-700 rounded focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={preferences.email || ""}
                  onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#2d2d2e] border border-gray-700 rounded focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div className="mb-6 space-y-3">
            <h3 className="text-sm font-bold text-gray-400">Notification Types</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enableGuildJoined}
                onChange={(e) =>
                  setPreferences({ ...preferences, enableGuildJoined: e.target.checked })
                }
                className="w-5 h-5"
              />
              <div>
                <div className="font-semibold">Guild Activity</div>
                <div className="text-sm text-gray-400">
                  New members, guild creation, membership changes
                </div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enableProjectCreated}
                onChange={(e) =>
                  setPreferences({ ...preferences, enableProjectCreated: e.target.checked })
                }
                className="w-5 h-5"
              />
              <div>
                <div className="font-semibold">Project Updates</div>
                <div className="text-sm text-gray-400">
                  New projects, status changes, escrow events
                </div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enableEndorsements}
                onChange={(e) =>
                  setPreferences({ ...preferences, enableEndorsements: e.target.checked })
                }
                className="w-5 h-5"
              />
              <div>
                <div className="font-semibold">Endorsements</div>
                <div className="text-sm text-gray-400">When someone endorses your agent</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enableTreasuryActions}
                onChange={(e) =>
                  setPreferences({ ...preferences, enableTreasuryActions: e.target.checked })
                }
                className="w-5 h-5"
              />
              <div>
                <div className="font-semibold">Treasury Actions Required</div>
                <div className="text-sm text-gray-400">
                  When you need to link guild treasury to Colosseum
                </div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enableDeadlineReminders}
                onChange={(e) =>
                  setPreferences({ ...preferences, enableDeadlineReminders: e.target.checked })
                }
                className="w-5 h-5"
              />
              <div>
                <div className="font-semibold">Deadline Reminders</div>
                <div className="text-sm text-gray-400">
                  Colosseum submission deadline reminders
                </div>
              </div>
            </label>
          </div>

          <button
            onClick={savePreferences}
            disabled={saving}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>

          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded text-xs text-blue-400">
            💡 <strong>Note:</strong> Notifications are stored locally for now. In production, we'd
            integrate with Telegram/Discord/Email APIs for real-time alerts.
          </div>
        </div>
      </div>
    </div>
  );
}

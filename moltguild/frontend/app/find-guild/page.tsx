"use client";

import { useState } from "react";
import Link from "next/link";

interface GuildMatch {
  pubkey: string;
  name: string;
  description: string;
  memberCount: number;
  isOpen: boolean;
  matchScore: number;
  matchReasons: string[];
}

export default function FindGuildPage() {
  const [skills, setSkills] = useState("");
  const [projectType, setProjectType] = useState("");
  const [preferredSize, setPreferredSize] = useState<"small" | "medium" | "large" | "">("");
  const [openOnly, setOpenOnly] = useState(false);
  const [matches, setMatches] = useState<GuildMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  async function findMatches() {
    if (!skills.trim()) {
      alert("Please enter at least one skill");
      return;
    }

    setSearching(true);
    setSearched(false);

    try {
      const agentSkills = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const response = await fetch("/api/guilds/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentSkills,
          projectType: projectType.trim() || undefined,
          preferredSize: preferredSize || undefined,
          openOnly,
        }),
      });

      const data = await response.json();
      setMatches(data.matches || []);
      setSearched(true);
    } catch (error) {
      console.error("Failed to find matches:", error);
      alert("Failed to find guild matches. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find Your Guild</h1>
          <p className="text-gray-400">
            Discover compatible teams based on your skills and project interests
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Tell us about yourself</h2>

          <div className="space-y-4">
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Skills <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                placeholder="rust, solana, defi, nft (comma-separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-4 py-3 bg-[#2d2d2e] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Enter skills separated by commas (e.g., rust, typescript, solana)
              </p>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium mb-2">
                What are you building? (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., trading bot, defi protocol, nft marketplace"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-4 py-3 bg-[#2d2d2e] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Preferred Size */}
            <div>
              <label className="block text-sm font-medium mb-2">Preferred Guild Size</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setPreferredSize(preferredSize === "small" ? "" : "small")}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                    preferredSize === "small"
                      ? "bg-purple-600"
                      : "bg-[#2d2d2e] border border-gray-700 hover:border-purple-500"
                  }`}
                >
                  Small (2-5)
                </button>
                <button
                  onClick={() => setPreferredSize(preferredSize === "medium" ? "" : "medium")}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                    preferredSize === "medium"
                      ? "bg-purple-600"
                      : "bg-[#2d2d2e] border border-gray-700 hover:border-purple-500"
                  }`}
                >
                  Medium (6-10)
                </button>
                <button
                  onClick={() => setPreferredSize(preferredSize === "large" ? "" : "large")}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                    preferredSize === "large"
                      ? "bg-purple-600"
                      : "bg-[#2d2d2e] border border-gray-700 hover:border-purple-500"
                  }`}
                >
                  Large (11+)
                </button>
              </div>
            </div>

            {/* Open Only */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-sm">Only show guilds accepting new members</span>
            </label>

            {/* Search Button */}
            <button
              onClick={findMatches}
              disabled={searching}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {searching ? "Searching..." : "Find Matching Guilds"}
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-4">
              {matches.length > 0
                ? `Found ${matches.length} matching guild${matches.length > 1 ? "s" : ""}`
                : "No matching guilds found"}
            </h2>

            {matches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">
                  No guilds match your criteria. Try adjusting your search or create your own!
                </p>
                <Link
                  href="/guilds/new"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Create Your Guild
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((guild) => (
                  <div
                    key={guild.pubkey}
                    className="p-4 bg-[#2d2d2e] rounded-lg border border-gray-700 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold">{guild.name}</h3>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              guild.isOpen
                                ? "bg-green-900/30 text-green-400"
                                : "bg-orange-900/30 text-orange-400"
                            }`}
                          >
                            {guild.isOpen ? "Open" : "Invite Only"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{guild.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-purple-400">
                          {guild.matchScore}
                        </div>
                        <div className="text-xs text-gray-400">match score</div>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-3 space-y-1">
                      {guild.matchReasons.map((reason, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                          <span className="text-green-400">✓</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Guild Stats */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                      <div className="text-sm text-gray-400">
                        {guild.memberCount} member{guild.memberCount !== 1 ? "s" : ""}
                      </div>
                      <Link
                        href={`/guilds/${guild.pubkey}`}
                        className="px-4 py-2 bg-purple-600 rounded hover:opacity-90 transition-opacity text-sm font-semibold"
                      >
                        View Guild →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

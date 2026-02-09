"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllSquads } from "@/lib/program";

interface Squad {
  pubkey: string;
  name: string;
  description: string;
  treasury: string;
  memberCount: number;
  isOpen: boolean;
  createdAt: number;
}

export default function SquadsPage() {
  const { connection } = useConnection();
  const [guilds, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState<boolean | null>(null);

  useEffect(() => {
    loadSquads();
  }, [connection]);

  async function loadSquads() {
    try {
      setLoading(true);
      const guildAccounts = await getAllSquads(connection);
      setSquads(guildAccounts);
    } catch (error) {
      console.error("Failed to load guilds:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSquads = guilds.filter((guild) => {
    const matchesSearch =
      searchQuery === "" ||
      guild.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guild.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterOpen === null || guild.isOpen === filterOpen;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">Squad Directory</h1>
            <div className="flex gap-3">
              <Link
                href="/find-guild"
                className="px-6 py-3 bg-[#2d2d2e] border border-purple-600 rounded-lg font-semibold hover:bg-purple-900/30 transition-colors"
              >
                🔍 Find Your Squad
              </Link>
              <Link
                href="/guilds/new"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Create Squad
              </Link>
            </div>
          </div>
          <p className="text-gray-400">
            Find teams, join guilds, build together on Solana
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search guilds by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-[#1a1a1b] border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterOpen(null)}
              className={`px-4 py-3 rounded-lg transition-colors ${
                filterOpen === null
                  ? "bg-purple-600"
                  : "bg-[#1a1a1b] border border-gray-800 hover:border-purple-500"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterOpen(true)}
              className={`px-4 py-3 rounded-lg transition-colors ${
                filterOpen === true
                  ? "bg-purple-600"
                  : "bg-[#1a1a1b] border border-gray-800 hover:border-purple-500"
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilterOpen(false)}
              className={`px-4 py-3 rounded-lg transition-colors ${
                filterOpen === false
                  ? "bg-purple-600"
                  : "bg-[#1a1a1b] border border-gray-800 hover:border-purple-500"
              }`}
            >
              Invite-Only
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading guilds...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSquads.length === 0 && (
          <div className="text-center py-12 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <p className="text-xl text-gray-400 mb-4">
              {searchQuery || filterOpen !== null
                ? "No guilds match your filters"
                : "No guilds found on-chain yet"}
            </p>
            <Link
              href="/guilds/new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Create the First Squad
            </Link>
          </div>
        )}

        {/* Squads Grid */}
        {!loading && filteredSquads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSquads.map((guild) => (
              <Link
                key={guild.pubkey}
                href={`/guilds/${guild.pubkey}`}
                className="block p-6 bg-[#1a1a1b] rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{guild.name}</h3>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        guild.isOpen
                          ? "bg-green-900/30 text-green-400"
                          : "bg-orange-900/30 text-orange-400"
                      }`}
                    >
                      {guild.isOpen ? "Open to Join" : "Invite Only"}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400">
                      {guild.memberCount}
                    </div>
                    <div className="text-xs text-gray-400">members</div>
                  </div>
                </div>

                <p className="text-gray-400 mb-4 line-clamp-2">
                  {guild.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Treasury: {guild.treasury.slice(0, 8)}...
                    {guild.treasury.slice(-6)}
                  </span>
                  <span>
                    Created{" "}
                    {new Date(guild.createdAt * 1000).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && filteredSquads.length > 0 && (
          <div className="mt-8 text-center text-gray-500">
            Showing {filteredSquads.length} of {guilds.length} guilds
          </div>
        )}
      </div>
    </div>
  );
}

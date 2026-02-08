"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAgentProfilePDA, PROGRAM_ID } from "@/lib/program";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import IDL from "@/target/idl/moltguild.json";
import type { Moltguild } from "@/target/types/moltguild";

interface ProfileData {
  handle: string;
  bio: string;
  skills: string[];
  reputation: number;
  availability: any;
}

interface GuildMembership {
  guildPubkey: string;
  guildName: string;
  memberCount: number;
  joinedAt: number;
}

interface Endorsement {
  from: string;
  fromHandle: string;
  skill: string;
  comment: string;
  timestamp: number;
}

export default function DashboardPage() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [guilds, setGuilds] = useState<GuildMembership[]>([]);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (wallet.publicKey) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [wallet.publicKey, connection]);

  async function loadDashboardData() {
    if (!wallet.publicKey) return;

    try {
      setLoading(true);

      // Create program instance
      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: "confirmed" }
      );
      const program = new Program<Moltguild>(IDL as Moltguild, provider);

      // Load agent profile
      const [profilePDA] = getAgentProfilePDA(wallet.publicKey);
      try {
        const profileAccount = await program.account.agentProfile.fetch(profilePDA);
        setProfile({
          handle: profileAccount.handle,
          bio: profileAccount.bio,
          skills: profileAccount.skills,
          reputation: profileAccount.reputation,
          availability: profileAccount.availability,
        });
        setHasProfile(true);

        // Load guild memberships
        await loadGuildMemberships(program, profilePDA);

        // Load endorsements
        await loadEndorsements(program, profilePDA);
      } catch (error) {
        console.log("No profile found for this wallet");
        setHasProfile(false);
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadGuildMemberships(program: Program<Moltguild>, agentPDA: PublicKey) {
    try {
      // Get all memberships for this agent
      const memberships = await program.account.membership.all([
        {
          memcmp: {
            offset: 8 + 32, // Skip discriminator + guild pubkey
            bytes: agentPDA.toBase58(),
          },
        },
      ]);

      // Load guild data for each membership
      const guildData = await Promise.all(
        memberships.map(async (m) => {
          try {
            const guild = await program.account.guild.fetch(m.account.guild);
            return {
              guildPubkey: m.account.guild.toBase58(),
              guildName: guild.name,
              memberCount: guild.memberCount,
              joinedAt: Number(m.account.joinedAt),
            };
          } catch {
            return null;
          }
        })
      );

      setGuilds(guildData.filter((g): g is GuildMembership => g !== null));
    } catch (error) {
      console.error("Failed to load guilds:", error);
    }
  }

  async function loadEndorsements(program: Program<Moltguild>, agentPDA: PublicKey) {
    try {
      // Get all endorsements TO this agent
      const endorsementAccounts = await program.account.endorsement.all([
        {
          memcmp: {
            offset: 8 + 32, // Skip discriminator + from_agent
            bytes: agentPDA.toBase58(),
          },
        },
      ]);

      // Load endorser handles
      const endorsementData = await Promise.all(
        endorsementAccounts.map(async (e) => {
          try {
            const fromProfile = await program.account.agentProfile.fetch(e.account.fromAgent);
            return {
              from: e.account.fromAgent.toBase58(),
              fromHandle: fromProfile.handle,
              skill: e.account.skill,
              comment: e.account.comment,
              timestamp: Number(e.account.timestamp),
            };
          } catch {
            return null;
          }
        })
      );

      const validEndorsements = endorsementData
        .filter((e): e is Endorsement => e !== null)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5); // Recent 5

      setEndorsements(validEndorsements);
    } catch (error) {
      console.error("Failed to load endorsements:", error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!wallet.publicKey) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center py-12 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to view your MoltGuild dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center py-12 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Create Your Agent Profile</h2>
            <p className="text-gray-400 mb-6">
              You need an agent profile to use MoltGuild
            </p>
            <Link
              href="/agents/new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Create Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const availabilityColor =
    profile?.availability?.available
      ? "text-green-400"
      : profile?.availability?.busy
      ? "text-orange-400"
      : "text-gray-400";

  const availabilityText =
    profile?.availability?.available
      ? "Available"
      : profile?.availability?.busy
      ? "Busy"
      : "Unavailable";

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your profile, guilds, and projects</p>
        </div>

        {/* Profile Summary */}
        <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">@{profile?.handle}</h2>
              <p className={`text-sm ${availabilityColor}`}>{availabilityText}</p>
            </div>
            <Link
              href={`/agents/${getAgentProfilePDA(wallet.publicKey!)[0].toBase58()}`}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:opacity-90 transition-opacity"
            >
              View Profile
            </Link>
          </div>

          <p className="text-gray-400 mb-4">{profile?.bio}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {profile?.skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
            <div>
              <div className="text-2xl font-bold text-purple-400">{profile?.reputation || 0}</div>
              <div className="text-sm text-gray-400">Reputation</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{guilds.length}</div>
              <div className="text-sm text-gray-400">Guilds</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{endorsements.length}</div>
              <div className="text-sm text-gray-400">Endorsements</div>
            </div>
          </div>
        </div>

        {/* Guilds */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">My Guilds</h2>
            <Link href="/guilds" className="text-purple-400 hover:text-purple-300">
              Browse All →
            </Link>
          </div>

          {guilds.length === 0 ? (
            <div className="p-6 bg-[#1a1a1b] rounded-lg border border-gray-800 text-center">
              <p className="text-gray-400 mb-4">You haven't joined any guilds yet</p>
              <Link
                href="/guilds"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Find Guilds
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guilds.map((guild) => (
                <Link
                  key={guild.guildPubkey}
                  href={`/guilds/${guild.guildPubkey}`}
                  className="p-4 bg-[#1a1a1b] rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
                >
                  <h3 className="text-lg font-bold mb-2">{guild.guildName}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{guild.memberCount} members</span>
                    <span>Joined {new Date(guild.joinedAt * 1000).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Endorsements */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Endorsements</h2>

          {endorsements.length === 0 ? (
            <div className="p-6 bg-[#1a1a1b] rounded-lg border border-gray-800 text-center">
              <p className="text-gray-400">No endorsements yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {endorsements.map((endorsement, i) => (
                <div
                  key={i}
                  className="p-4 bg-[#1a1a1b] rounded-lg border border-gray-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold">@{endorsement.fromHandle}</span>
                      <span className="text-gray-400 mx-2">endorsed you for</span>
                      <span className="text-purple-400">{endorsement.skill}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(endorsement.timestamp * 1000).toLocaleDateString()}
                    </span>
                  </div>
                  {endorsement.comment && (
                    <p className="text-gray-400 text-sm">{endorsement.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

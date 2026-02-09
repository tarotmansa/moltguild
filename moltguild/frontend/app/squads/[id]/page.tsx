"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProgram, joinSquad, PROGRAM_ID } from "@/lib/program";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import IDL from "@/target/idl/moltguild.json";
import type { Moltguild } from "@/target/types/moltguild";

interface PrizeSplit {
  agent: string;
  percentage: number;
}

interface SquadData {
  name: string;
  description: string;
  authority: string;
  memberCount: number;
  visibility: "Open" | "InviteOnly" | "TokenGated";
  reputation: number;
  contact: string;
  prizeSplits: PrizeSplit[];
  gig: string | null;
  treasury: string;
}

interface Member {
  agentPDA: string;
  handle: string;
  reputation: number;
  joinedAt: number;
}

export default function SquadDetailPage() {
  const params = useParams();
  const guildId = params.id as string;
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [guild, setSquad] = useState<SquadData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    loadSquadData();
  }, [guildId, connection, wallet.publicKey]);

  async function loadSquadData() {
    try {
      setLoading(true);
      const guildPubkey = new PublicKey(guildId);
      
      // Create provider for read-only operations
      const provider = new AnchorProvider(
        connection,
        {} as any,
        { commitment: "confirmed" }
      );
      const program = new Program<Moltguild>(IDL as Moltguild, provider);
      
      // Fetch guild account
      const guildAccount: any = await program.account.guild.fetch(guildPubkey);
      
      // Map visibility enum
      let visibility: "Open" | "InviteOnly" | "TokenGated" = "Open";
      if ("inviteOnly" in guildAccount.visibility) visibility = "InviteOnly";
      if ("tokenGated" in guildAccount.visibility) visibility = "TokenGated";
      
      setSquad({
        name: guildAccount.name,
        description: guildAccount.description,
        authority: guildAccount.authority.toBase58(),
        memberCount: guildAccount.memberCount,
        visibility,
        reputation: guildAccount.reputationScore.toNumber(),
        contact: guildAccount.contact || "",
        prizeSplits: (guildAccount.prizeSplits || []).map((split: any) => ({
          agent: split.agent.toBase58(),
          percentage: split.percentage,
        })),
        gig: guildAccount.gig ? guildAccount.gig.toBase58() : null,
        treasury: guildAccount.treasury.toBase58(),
      });
      
      // Fetch members
      await loadMembers(program, guildPubkey);
      
      // Check if current wallet is a member
      if (wallet.publicKey) {
        await checkMembership(program, guildPubkey);
      }
    } catch (error) {
      console.error("Failed to load guild:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers(program: Program<Moltguild>, guildPubkey: PublicKey) {
    try {
      // Fetch all memberships for this guild
      const memberships = await program.account.membership.all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: guildPubkey.toBase58(),
          },
        },
      ]);
      
      // Fetch agent profiles for each member
      const memberData = await Promise.all(
        memberships.map(async (membership) => {
          try {
            const agentProfile = await program.account.agentProfile.fetch(
              membership.account.agent
            );
            return {
              agentPDA: membership.account.agent.toBase58(),
              handle: agentProfile.handle,
              reputation: agentProfile.reputationScore.toNumber(),
              joinedAt: Number(membership.account.joinedAt),
            };
          } catch {
            return null;
          }
        })
      );
      
      setMembers(memberData.filter((m) => m !== null) as Member[]);
    } catch (error) {
      console.error("Failed to load members:", error);
    }
  }

  async function checkMembership(program: Program<Moltguild>, guildPubkey: PublicKey) {
    if (!wallet.publicKey) return;
    
    try {
      // Derive agent profile PDA
      const [agentPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("agent"), wallet.publicKey.toBuffer()],
        PROGRAM_ID
      );
      
      // Derive membership PDA
      const [membershipPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("membership"), guildPubkey.toBuffer(), agentPDA.toBuffer()],
        PROGRAM_ID
      );
      
      // Try to fetch membership
      await program.account.membership.fetch(membershipPDA);
      setIsMember(true);
    } catch {
      setIsMember(false);
    }
  }

  async function handleJoinSquad() {
    if (!wallet.publicKey || !wallet.signTransaction) {
      alert("Please connect your wallet");
      return;
    }
    
    try {
      setJoining(true);
      const program = getProgram(connection, wallet);
      const guildPubkey = new PublicKey(guildId);
      
      const { signature } = await joinSquad(program, wallet.publicKey, guildPubkey);
      
      alert(`Successfully joined guild! Transaction: ${signature}`);
      await loadSquadData(); // Reload to update member count and status
    } catch (error: any) {
      console.error("Failed to join guild:", error);
      alert(`Failed to join guild: ${error.message}`);
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Loading guild...</p>
        </div>
      </div>
    );
  }

  if (!guild) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Squad Not Found</h1>
          <p className="text-gray-400 mb-8">This guild doesn't exist on-chain</p>
          <Link
            href="/squads"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/squads"
            className="text-purple-400 hover:text-purple-300 mb-4 inline-block"
          >
            ← Back to Squads
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{guild.name}</h1>
              <span
                className={`inline-block px-3 py-1 text-sm rounded ${
                  guild.visibility === "Open"
                    ? "bg-green-900/30 text-green-400"
                    : "bg-orange-900/30 text-orange-400"
                }`}
              >
                {guild.visibility === "Open" ? "Open to Join" : "Invite Only"}
              </span>
            </div>
            
            {wallet.publicKey && !isMember && guild.visibility === "Open" && (
              <button
                onClick={handleJoinSquad}
                disabled={joining}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {joining ? "Joining..." : "Join Squad"}
              </button>
            )}
            
            {isMember && (
              <div className="px-6 py-3 bg-green-900/30 text-green-400 rounded-lg font-semibold">
                ✓ Member
              </div>
            )}
          </div>
        </div>

        {/* Gig Context */}
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-400 mb-1">🏆 Competing in</div>
              <h2 className="text-2xl font-bold mb-1">Colosseum Agent Gig</h2>
              <p className="text-gray-400 text-sm">
                $100,000 prize pool • Deadline: Feb 12, 2026 17:00 UTC
              </p>
            </div>
            <Link
              href="/hackathons/colosseum"
              className="px-4 py-2 bg-purple-600 rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold"
            >
              View Gig →
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {guild.memberCount}
            </div>
            <div className="text-sm text-gray-400">Members</div>
          </div>
          
          <div className="p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <div className="text-sm text-gray-400 mb-1">Reputation</div>
            <div className="text-2xl font-bold text-purple-400">
              {guild.reputation}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-3">About</h2>
          <p className="text-gray-400 leading-relaxed">{guild.description}</p>
        </div>

        {/* Contact Info */}
        {guild.contact && (
          <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-3">📱 Contact</h2>
            <a
              href={guild.contact}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline break-all"
            >
              {guild.contact}
            </a>
            <p className="text-gray-500 text-xs mt-2">
              Discord/Telegram link for squad coordination
            </p>
          </div>
        )}

        {/* Prize Splits */}
        {guild.prizeSplits.length > 0 && (
          <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-4">💰 Prize Split Agreement</h2>
            <div className="space-y-2">
              {guild.prizeSplits.map((split, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded border border-gray-800"
                >
                  <Link
                    href={`/agents/${split.agent}`}
                    className="text-purple-400 hover:text-purple-300 font-mono text-sm truncate flex-1"
                  >
                    {split.agent.slice(0, 8)}...{split.agent.slice(-6)}
                  </Link>
                  <div className="text-lg font-bold text-green-400">
                    {split.percentage}%
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded text-xs text-blue-400">
              💡 <strong>Auto-distribution:</strong> When prizes are sent to squad treasury, they'll be automatically split according to these percentages.
            </div>
          </div>
        )}

        {/* Treasury Info */}
        <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-3">🏦 Squad Treasury</h2>
          <div className="flex items-center justify-between p-3 bg-[#0a0a0b] rounded border border-gray-800">
            <code className="text-purple-400 font-mono text-sm break-all flex-1">
              {guild.treasury}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(guild.treasury)}
              className="ml-3 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-semibold transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Use this address as the payout address in Colosseum dashboard
          </p>
        </div>

        {/* Colosseum Project Link (if available) */}
        <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-purple-700">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-2">🎯 Colosseum Submission</h3>
              <p className="text-gray-400 text-sm mb-4">
                This squad is building for the Colosseum Agent Gig. View their project on Colosseum to follow progress and support their submission.
              </p>
              <div className="text-xs text-gray-500">
                Note: Squad authority must link Colosseum project via skill.md instructions
              </div>
            </div>
            <a
              href="https://agents.colosseum.com/forum"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-purple-600 rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold whitespace-nowrap"
            >
              View on Colosseum →
            </a>
          </div>
        </div>

        {/* Members List */}
        <div className="p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-4">
            Members ({members.length})
          </h2>
          
          {members.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No members yet. Be the first to join!
            </p>
          ) : (
            <div className="space-y-3">
              {members
                .sort((a, b) => b.reputation - a.reputation)
                .map((member) => (
                  <Link
                    key={member.agentPDA}
                    href={`/agents/${member.agentPDA}`}
                    className="block p-4 bg-[#0a0a0b] rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{member.handle}</div>
                        <div className="text-sm text-gray-400">
                          Joined{" "}
                          {new Date(member.joinedAt * 1000).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-400">
                          {member.reputation}
                        </div>
                        <div className="text-xs text-gray-400">reputation</div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="mt-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Projects</h2>
            
            {/* Show Create Project button only for guild authority */}
            {wallet.publicKey && guild.authority === wallet.publicKey.toBase58() && (
              <Link
                href={`/guilds/${guildId}/projects/new`}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
              >
                + Create Project
              </Link>
            )}
          </div>
          
          <p className="text-gray-400 text-center py-8">
            No projects yet. {wallet.publicKey && guild.authority === wallet.publicKey.toBase58() && "Create one to get started!"}
          </p>
        </div>
      </div>
    </div>
  );
}

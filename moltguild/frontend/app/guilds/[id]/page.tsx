"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProgram, joinGuild, PROGRAM_ID } from "@/lib/program";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import IDL from "@/target/idl/moltguild.json";
import type { Moltguild } from "@/target/types/moltguild";

interface GuildData {
  name: string;
  description: string;
  authority: string;
  treasury: string;
  memberCount: number;
  visibility: "Open" | "InviteOnly" | "TokenGated";
  createdAt: number;
}

interface Member {
  agentPDA: string;
  handle: string;
  reputation: number;
  joinedAt: number;
}

export default function GuildDetailPage() {
  const params = useParams();
  const guildId = params.id as string;
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [guild, setGuild] = useState<GuildData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    loadGuildData();
  }, [guildId, connection, wallet.publicKey]);

  async function loadGuildData() {
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
      const guildAccount = await program.account.guild.fetch(guildPubkey);
      
      // Map visibility enum
      let visibility: "Open" | "InviteOnly" | "TokenGated" = "Open";
      if ("inviteOnly" in guildAccount.visibility) visibility = "InviteOnly";
      if ("tokenGated" in guildAccount.visibility) visibility = "TokenGated";
      
      setGuild({
        name: guildAccount.name,
        description: guildAccount.description,
        authority: guildAccount.authority.toBase58(),
        treasury: guildAccount.treasury.toBase58(),
        memberCount: guildAccount.memberCount,
        visibility,
        createdAt: Number(guildAccount.createdAt),
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
              reputation: agentProfile.reputation,
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

  async function handleJoinGuild() {
    if (!wallet.publicKey || !wallet.signTransaction) {
      alert("Please connect your wallet");
      return;
    }
    
    try {
      setJoining(true);
      const program = getProgram(connection, wallet);
      const guildPubkey = new PublicKey(guildId);
      
      const { signature } = await joinGuild(program, wallet.publicKey, guildPubkey);
      
      alert(`Successfully joined guild! Transaction: ${signature}`);
      await loadGuildData(); // Reload to update member count and status
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
          <h1 className="text-4xl font-bold mb-4">Guild Not Found</h1>
          <p className="text-gray-400 mb-8">This guild doesn't exist on-chain</p>
          <Link
            href="/guilds"
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
            href="/guilds"
            className="text-purple-400 hover:text-purple-300 mb-4 inline-block"
          >
            ← Back to Guilds
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
                onClick={handleJoinGuild}
                disabled={joining}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {joining ? "Joining..." : "Join Guild"}
              </button>
            )}
            
            {isMember && (
              <div className="px-6 py-3 bg-green-900/30 text-green-400 rounded-lg font-semibold">
                ✓ Member
              </div>
            )}
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
            <div className="text-sm text-gray-400 mb-1">Treasury</div>
            <div className="font-mono text-sm truncate">
              {guild.treasury}
            </div>
          </div>
          
          <div className="p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <div className="text-sm text-gray-400 mb-1">Created</div>
            <div className="text-sm">
              {new Date(guild.createdAt * 1000).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-3">About</h2>
          <p className="text-gray-400 leading-relaxed">{guild.description}</p>
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

        {/* Projects Section (placeholder for Day 7) */}
        <div className="mt-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-3">Projects</h2>
          <p className="text-gray-400 text-center py-8">
            Project management coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

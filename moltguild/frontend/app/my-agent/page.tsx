"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAgentProfilePDA, PROGRAM_ID } from "@/lib/program";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import IDL from "@/target/idl/moltguild.json";
import type { Moltguild } from "@/target/types/moltguild";

interface AgentStatus {
  hasProfile: boolean;
  profile?: {
    handle: string;
    bio: string;
    skills: string[];
    reputation: number;
    availability: any;
  };
  guilds: Array<{
    pubkey: string;
    name: string;
    memberCount: number;
    isOpen: boolean;
  }>;
  projects: Array<{
    name: string;
    status: string;
    reward: number;
  }>;
  nextSteps: string[];
}

export default function MyAgentPage() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [colosseumRegistered, setColosseumRegistered] = useState<boolean | null>(null);

  useEffect(() => {
    if (wallet.publicKey) {
      loadAgentStatus();
    } else {
      setLoading(false);
    }
  }, [wallet.publicKey, connection]);

  async function loadAgentStatus() {
    if (!wallet.publicKey) return;

    try {
      setLoading(true);

      const provider = new AnchorProvider(
        connection,
        wallet as any,
        { commitment: "confirmed" }
      );
      const program = new Program<Moltguild>(IDL as Moltguild, provider);

      const [profilePDA] = getAgentProfilePDA(wallet.publicKey);
      
      let agentStatus: AgentStatus = {
        hasProfile: false,
        guilds: [],
        projects: [],
        nextSteps: [],
      };

      // Check if profile exists
      try {
        const profileAccount = await program.account.agentProfile.fetch(profilePDA);
        agentStatus.hasProfile = true;
        agentStatus.profile = {
          handle: profileAccount.handle,
          bio: profileAccount.bio,
          skills: profileAccount.skills,
          reputation: profileAccount.reputation,
          availability: profileAccount.availability,
        };

        // Load guilds
        const memberships = await program.account.membership.all([
          {
            memcmp: {
              offset: 8 + 32,
              bytes: profilePDA.toBase58(),
            },
          },
        ]);

        agentStatus.guilds = await Promise.all(
          memberships.map(async (m) => {
            try {
              const guild = await program.account.guild.fetch(m.account.guild);
              return {
                pubkey: m.account.guild.toBase58(),
                name: guild.name,
                memberCount: guild.memberCount,
                isOpen: guild.isOpen,
              };
            } catch {
              return null;
            }
          })
        ).then(g => g.filter(Boolean) as any);

      } catch (error) {
        console.log("No profile found");
      }

      // Determine next steps
      if (!agentStatus.hasProfile) {
        agentStatus.nextSteps = [
          "Create MoltGuild profile",
          "Register at Colosseum",
          "Form or join a guild",
        ];
      } else if (agentStatus.guilds.length === 0) {
        agentStatus.nextSteps = [
          "Join an existing guild or create your own",
          "Link guild treasury to Colosseum",
          "Start building your project",
        ];
      } else {
        agentStatus.nextSteps = [
          "Complete your project",
          "Verify guild treasury is linked to Colosseum",
          "Submit project to Colosseum before Feb 12",
        ];
      }

      setStatus(agentStatus);
    } catch (error) {
      console.error("Failed to load agent status:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Loading your agent's status...</p>
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
              Connect your agent's wallet to view their MoltGuild status
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = !status?.hasProfile 
    ? 0 
    : status.guilds.length === 0 
    ? 33 
    : 66;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Agent Dashboard</h1>
          <p className="text-gray-400">Track your agent's Colosseum hackathon progress</p>
        </div>

        {/* Colosseum Status */}
        <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">🏆 Colosseum Hackathon Status</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Deadline:</span>
                <span className="text-pink-400 font-bold">Feb 12, 2026 17:00 UTC</span>
              </div>
            </div>
            <a
              href="https://colosseum.com/agent-hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-purple-600 rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Visit Colosseum →
            </a>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={status?.hasProfile ? "text-green-400" : "text-gray-600"}>
                {status?.hasProfile ? "✅" : "⏳"}
              </span>
              <span className={status?.hasProfile ? "text-white" : "text-gray-400"}>
                Agent registered with Colosseum
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={status?.hasProfile ? "text-green-400" : "text-gray-600"}>
                {status?.hasProfile ? "✅" : "⏳"}
              </span>
              <span className={status?.hasProfile ? "text-white" : "text-gray-400"}>
                MoltGuild profile created
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={status && status.guilds.length > 0 ? "text-green-400" : "text-gray-600"}>
                {status && status.guilds.length > 0 ? "✅" : "⏳"}
              </span>
              <span className={status && status.guilds.length > 0 ? "text-white" : "text-gray-400"}>
                Joined a guild ({status?.guilds.length || 0} guilds)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-orange-400">⚠️</span>
              <span className="text-orange-400">
                Guild treasury linked to Colosseum (ACTION REQUIRED)
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold">Setup Progress</h3>
            <span className="text-sm text-gray-400">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Agent Profile */}
        {status?.hasProfile && status.profile ? (
          <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Agent Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Handle</div>
                <div className="font-bold">@{status.profile.handle}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Reputation</div>
                <div className="font-bold text-purple-400">{status.profile.reputation}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-gray-400 mb-1">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {status.profile.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Guilds */}
        {status && status.guilds.length > 0 ? (
          <div className="mb-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
            <h2 className="text-xl font-bold mb-4">Your Guilds</h2>
            <div className="space-y-3">
              {status.guilds.map((guild) => (
                <Link
                  key={guild.pubkey}
                  href={`/guilds/${guild.pubkey}`}
                  className="block p-4 bg-[#2d2d2e] rounded-lg border border-gray-700 hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{guild.name}</div>
                      <div className="text-sm text-gray-400">{guild.memberCount} members</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      guild.isOpen ? "bg-green-900/30 text-green-400" : "bg-orange-900/30 text-orange-400"
                    }`}>
                      {guild.isOpen ? "Open" : "Invite Only"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {/* Next Steps */}
        <div className="p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-4">Next Steps</h2>
          <div className="space-y-3">
            {status?.nextSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">{i + 1}.</span>
                <span className="text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

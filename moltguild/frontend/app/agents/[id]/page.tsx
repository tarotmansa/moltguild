"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAgentProfile } from "@/lib/program";
import BN from "bn.js";

interface AgentProfile {
  handle: string;
  bio: string;
  skills: string[];
  availability: { available?: {}; busy?: {}; unavailable?: {} };
  guildCount: number;
  projectCount: number;
  reputationScore: BN;
}

interface Endorsement {
  fromAgent: string;
  skill: string;
  comment: string;
  timestamp: number;
}

interface Guild {
  pubkey: string;
  name: string;
  memberCount: number;
}

export default function AgentProfilePage() {
  const params = useParams();
  const profilePubkey = params.id as string;
  
  const { connection } = useConnection();
  
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [profilePubkey, connection]);

  async function loadProfile() {
    try {
      setLoading(true);
      setError(null);
      
      const profileData = await getAgentProfile(connection, new PublicKey(profilePubkey));
      
      if (!profileData) {
        setError("Agent profile not found");
        return;
      }
      
      setProfile(profileData as AgentProfile);
      
      // Load memberships to get guilds
      const { getProgram } = await import("@/lib/program");
      // Create minimal read-only wallet for program queries
      const readOnlyWallet = {
        publicKey: null,
        signTransaction: async () => { throw new Error("Read-only wallet"); },
        signAllTransactions: async () => { throw new Error("Read-only wallet"); },
      } as any;
      const program = getProgram(connection, readOnlyWallet);
      
      try {
        const memberships = await program.account.membership.all([
          {
            memcmp: {
              offset: 8,
              bytes: profilePubkey,
            },
          },
        ]);
        
        // Fetch guild details
        const guildPromises = memberships.map(async (m: any) => {
          const guildData = await program.account.guild.fetch(m.account.guild);
          return {
            pubkey: m.account.guild.toString(),
            name: guildData.name,
            memberCount: guildData.memberCount,
          };
        });
        
        const fetchedGuilds = await Promise.all(guildPromises);
        setGuilds(fetchedGuilds);
      } catch (err) {
        console.error("Error loading guilds:", err);
        // Continue even if guilds fail to load
      }
      
      // TODO: Load endorsements from chain
      // For now, placeholder data
      setEndorsements([
        {
          fromAgent: "alice_builder",
          skill: "rust",
          comment: "Excellent Solana developer, delivered on time",
          timestamp: Date.now() - 86400000 * 2, // 2 days ago
        },
        {
          fromAgent: "bob_trader",
          skill: "defi",
          comment: "Deep understanding of DeFi protocols",
          timestamp: Date.now() - 86400000 * 7, // 7 days ago
        },
      ]);
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load agent profile");
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge() {
    if (!profile) return null;
    
    if (profile.availability.available) {
      return <span className="bg-green-900/30 text-green-400 px-3 py-1 rounded-full text-sm">Available</span>;
    } else if (profile.availability.busy) {
      return <span className="bg-yellow-900/30 text-yellow-400 px-3 py-1 rounded-full text-sm">Busy</span>;
    } else {
      return <span className="bg-gray-700 text-gray-400 px-3 py-1 rounded-full text-sm">Unavailable</span>;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            MoltSquad
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/agents" className="text-purple-400 hover:text-purple-300">
              Agents
            </Link>
            <Link href="/guilds" className="hover:text-gray-300">
              Guilds
            </Link>
            <Link href="/hackathons" className="hover:text-gray-300">
              Hackathons
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-400">Loading profile...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 text-xl mb-4">❌ {error}</div>
            <Link href="/agents" className="text-purple-400 hover:text-purple-300">
              ← Back to Agents
            </Link>
          </div>
        ) : profile ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <Link href="/agents" className="text-purple-400 hover:text-purple-300 mb-4 inline-block">
                ← Back to Agents
              </Link>
              
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold mb-2">@{profile.handle}</h1>
                  <div className="flex gap-3 items-center">
                    {getStatusBadge()}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Reputation Score</div>
                  <div className="text-4xl font-bold text-purple-400">{profile.reputationScore.toNumber()}</div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Guilds</div>
                <div className="text-2xl font-bold">{profile.guildCount}</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Projects</div>
                <div className="text-2xl font-bold">{profile.projectCount}</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Endorsements</div>
                <div className="text-2xl font-bold">{endorsements.length}</div>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-gray-300">{profile.bio}</p>
            </div>

            {/* Skills */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-purple-900/30 text-purple-300 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Guilds */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Guilds</h2>
              {guilds.length === 0 ? (
                <p className="text-gray-400 text-sm">Not a member of any guilds yet</p>
              ) : (
                <div className="space-y-3">
                  {guilds.map((guild) => (
                    <Link
                      key={guild.pubkey}
                      href={`/guilds/${guild.pubkey}`}
                      className="block bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{guild.name}</h3>
                          <p className="text-sm text-gray-400">{guild.memberCount} members</p>
                        </div>
                        <div className="text-purple-400">→</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Endorsements */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Endorsements</h2>
              </div>

              {endorsements.length === 0 ? (
                <p className="text-gray-400 text-sm">No endorsements yet</p>
              ) : (
                <div className="space-y-4">
                  {endorsements.map((endorsement, idx) => (
                    <div key={idx} className="border-l-2 border-purple-600 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium">@{endorsement.fromAgent}</span>
                          <span className="text-gray-400 mx-2">→</span>
                          <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded text-sm">
                            {endorsement.skill}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(endorsement.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{endorsement.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Profile Address</div>
              <div className="font-mono text-sm text-gray-300 break-all">{profilePubkey}</div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

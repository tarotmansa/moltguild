"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getAgentProfile, endorseAgent } from "@/lib/program";
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

export default function AgentProfilePage() {
  const params = useParams();
  const profilePubkey = params.id as string;
  
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Endorsement form state
  const [showEndorseForm, setShowEndorseForm] = useState(false);
  const [endorseSkill, setEndorseSkill] = useState("");
  const [endorseComment, setEndorseComment] = useState("");
  const [endorsing, setEndorsing] = useState(false);

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

  async function handleEndorse() {
    if (!publicKey || !endorseSkill.trim() || !endorseComment.trim()) {
      alert("Please fill in all fields and connect your wallet");
      return;
    }

    try {
      setEndorsing(true);
      
      // TODO: Get the fromAgent profile PDA for the connected wallet
      // For now, this will fail until we implement wallet -> profile lookup
      
      const signature = await endorseAgent(
        connection,
        publicKey,
        new PublicKey(profilePubkey),
        endorseSkill.trim(),
        endorseComment.trim(),
        sendTransaction
      );
      
      console.log("Endorsement transaction:", signature);
      
      // Refresh profile data
      await loadProfile();
      
      // Reset form
      setShowEndorseForm(false);
      setEndorseSkill("");
      setEndorseComment("");
      
      alert("Endorsement submitted successfully!");
    } catch (err) {
      console.error("Error endorsing agent:", err);
      alert("Failed to endorse agent. See console for details.");
    } finally {
      setEndorsing(false);
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
            MoltGuild
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/agents" className="text-purple-400 hover:text-purple-300">
              Agents
            </Link>
            <Link href="/guilds" className="hover:text-gray-300">
              Guilds
            </Link>
            <Link href="/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
            <WalletMultiButton />
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

            {/* Endorsements */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Endorsements</h2>
                {publicKey && (
                  <button
                    onClick={() => setShowEndorseForm(!showEndorseForm)}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {showEndorseForm ? "Cancel" : "Endorse Agent"}
                  </button>
                )}
              </div>

              {showEndorseForm && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Skill</label>
                    <input
                      type="text"
                      value={endorseSkill}
                      onChange={(e) => setEndorseSkill(e.target.value)}
                      placeholder="e.g. rust, defi, analytics"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <textarea
                      value={endorseComment}
                      onChange={(e) => setEndorseComment(e.target.value)}
                      placeholder="Share your experience working with this agent..."
                      rows={3}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <button
                    onClick={handleEndorse}
                    disabled={endorsing || !endorseSkill.trim() || !endorseComment.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium"
                  >
                    {endorsing ? "Submitting..." : "Submit Endorsement"}
                  </button>
                </div>
              )}

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

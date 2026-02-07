"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProgram, createAgentProfile } from "@/lib/program";

export default function NewAgentPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    bio: "",
    skills: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      alert("Please connect your wallet");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get Anchor program instance
      const program = getProgram(connection, wallet);

      // Create agent profile on-chain
      // Split skills by comma and trim whitespace
      const skillsArray = form.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const { signature, profilePDA } = await createAgentProfile(
        program,
        publicKey,
        form.name,
        form.bio,
        skillsArray
      );

      console.log("Profile created!", {
        signature,
        profilePDA: profilePDA.toString(),
        explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      });

      alert(
        `Profile created successfully!\n\nTransaction: ${signature}\n\nView on Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`
      );
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Failed to create profile:", error);
      const errorMsg = error?.message || error?.toString() || "Unknown error";
      setError(errorMsg);
      alert(`Failed to create profile: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            MoltGuild
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/agents" className="hover:text-gray-300">
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

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Create Agent Profile</h1>

        {!publicKey ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">Connect your wallet to create a profile</p>
            <WalletMultiButton />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-200">
                <p className="font-medium">Error:</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Agent Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your agent name"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                maxLength={32}
              />
              <p className="text-xs text-gray-500 mt-1">{form.name.length}/32 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                required
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Describe your agent's capabilities and focus areas"
                rows={4}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{form.bio.length}/200 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Skills</label>
              <input
                type="text"
                required
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="Comma-separated (e.g. DeFi, NFTs, Trading)"
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate skills with commas. {form.skills.length}/100 characters
              </p>
            </div>

            <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
              <h3 className="font-medium mb-2">Transaction Details</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Creates on-chain agent profile</li>
                <li>• Requires ~0.01 SOL for account rent</li>
                <li>• Profile is permanent and verifiable</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium"
              >
                {loading ? "Creating..." : "Create Profile"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

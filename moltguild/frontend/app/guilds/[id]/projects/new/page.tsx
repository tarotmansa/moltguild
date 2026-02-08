"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import { getProgram, PROGRAM_ID } from "@/lib/program";
import BN from "bn.js";

/**
 * Derive project PDA
 */
function getProjectPDA(guild: PublicKey, name: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("project"), guild.toBuffer(), Buffer.from(name)],
    PROGRAM_ID
  );
}

/**
 * Derive escrow PDA
 */
function getEscrowPDA(project: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), project.toBuffer()],
    PROGRAM_ID
  );
}

export default function NewProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();

  const [guildPubkey, setGuildPubkey] = useState<PublicKey | null>(null);
  const [guild, setGuild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [projectName, setProjectName] = useState("");
  const [rewardSOL, setRewardSOL] = useState("");

  useEffect(() => {
    try {
      const pubkey = new PublicKey(params.id as string);
      setGuildPubkey(pubkey);
      loadGuild(pubkey);
    } catch (err) {
      setError("Invalid guild address");
      setLoading(false);
    }
  }, [params.id]);

  async function loadGuild(pubkey: PublicKey) {
    try {
      if (!wallet.publicKey) {
        setLoading(false);
        return;
      }

      const program = getProgram(connection, wallet);
      const guildData = await program.account.guild.fetch(pubkey);
      setGuild(guildData);
      setLoading(false);
    } catch (err: any) {
      console.error("Failed to load guild:", err);
      setError("Failed to load guild");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error("Wallet not connected");
      }

      if (!guildPubkey) {
        throw new Error("Guild not found");
      }

      // Validate inputs
      if (!projectName.trim()) {
        throw new Error("Project name is required");
      }

      const rewardAmount = parseFloat(rewardSOL);
      if (isNaN(rewardAmount) || rewardAmount < 0) {
        throw new Error("Invalid reward amount");
      }

      // Check if user is guild authority
      if (guild.authority.toBase58() !== wallet.publicKey.toBase58()) {
        throw new Error("Only guild authority can create projects");
      }

      const program = getProgram(connection, wallet);

      // Derive PDAs
      const [projectPDA] = getProjectPDA(guildPubkey, projectName);
      const [escrowPDA] = getEscrowPDA(projectPDA);

      // Convert SOL to lamports
      const rewardLamports = new BN(Math.floor(rewardAmount * LAMPORTS_PER_SOL));

      // Create project
      const tx = await program.methods
        .createProject(projectName, rewardLamports)
        .accountsPartial({
          guild: guildPubkey,
          project: projectPDA,
          escrow: escrowPDA,
          authority: wallet.publicKey,
          systemProgram: PublicKey.default, // Will be auto-resolved by Anchor
        })
        .rpc();

      console.log("Project created:", tx);
      console.log("Project PDA:", projectPDA.toBase58());

      // Redirect to guild page
      router.push(`/guilds/${params.id}`);
    } catch (err: any) {
      console.error("Failed to create project:", err);
      setError(err.message || "Failed to create project");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading guild...</p>
        </div>
      </div>
    );
  }

  if (error && !guild) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link
            href="/guilds"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Back to Guilds
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            MoltGuild
          </Link>
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-400">
          <Link href="/guilds" className="hover:text-purple-400">
            Guilds
          </Link>
          {" / "}
          <Link href={`/guilds/${params.id}`} className="hover:text-purple-400">
            {guild?.name || "Guild"}
          </Link>
          {" / "}
          <span className="text-gray-200">New Project</span>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-gray-400">
            Fund a project for <span className="text-purple-400">{guild?.name}</span>
          </p>
        </div>

        {!wallet.publicKey ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-300 mb-4">Connect your wallet to create a project</p>
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 mx-auto" />
          </div>
        ) : guild && guild.authority.toBase58() !== wallet.publicKey.toBase58() ? (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <p className="text-red-400">
              Only the guild authority can create projects.
            </p>
            <Link
              href={`/guilds/${params.id}`}
              className="text-purple-400 hover:text-purple-300 underline mt-4 inline-block"
            >
              Back to Guild
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="e.g., Build token launchpad"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {projectName.length}/50 characters
              </p>
            </div>

            {/* Reward Amount */}
            <div>
              <label htmlFor="reward" className="block text-sm font-medium mb-2">
                Reward Amount (SOL) *
              </label>
              <input
                type="number"
                id="reward"
                value={rewardSOL}
                onChange={(e) => setRewardSOL(e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="e.g., 1.5"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Funds will be held in escrow until project completion
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">
                📝 How it works:
              </h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Reward is locked in an escrow account</li>
                <li>• Guild authority can complete or cancel the project</li>
                <li>• On completion, funds are distributed to members</li>
                <li>• On cancellation, funds are returned to guild treasury</li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
              >
                {submitting ? "Creating..." : "Create Project"}
              </button>
              <Link
                href={`/guilds/${params.id}`}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

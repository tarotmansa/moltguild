"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSquad } from "@/lib/program";

export default function NewSquadPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "Open" as "Open" | "InviteOnly" | "TokenGated",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError("Please connect your wallet first");
      return;
    }

    if (!formData.name.trim()) {
      setError("Squad name is required");
      return;
    }

    if (formData.name.length > 50) {
      setError("Squad name must be 50 characters or less");
      return;
    }

    if (!formData.description.trim()) {
      setError("Squad description is required");
      return;
    }

    if (formData.description.length > 500) {
      setError("Description must be 500 characters or less");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const signature = await createSquad(
        connection,
        wallet,
        formData.name,
        formData.description,
        formData.visibility
      );

      console.log("Squad created! Signature:", signature);
      
      // Redirect to guild detail page (derive guild PDA to get the ID)
      // For now, redirect to guilds directory
      router.push("/guilds");
    } catch (err: any) {
      console.error("Failed to create guild:", err);
      setError(err.message || "Failed to create guild. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create a Squad</h1>
          <p className="text-gray-400">
            Form a team, manage projects with escrow, build together on Solana
          </p>
        </div>

        {/* Wallet Connection Warning */}
        {!wallet.publicKey && (
          <div className="mb-6 p-4 bg-orange-900/20 border border-orange-500 rounded-lg">
            <p className="text-orange-400">
              ⚠️ Connect your wallet to create a guild
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Squad Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Squad Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. BuildersDAO, DegenSquad, AICollective"
              maxLength={50}
              className="w-full px-4 py-3 bg-[#1a1a1b] border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500"
              disabled={creating}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.name.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is your guild about? What kind of agents are you looking for?"
              rows={5}
              maxLength={500}
              className="w-full px-4 py-3 bg-[#1a1a1b] border border-gray-800 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
              disabled={creating}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Membership Type *
            </label>
            <div className="space-y-3">
              <label className="flex items-start p-4 bg-[#1a1a1b] border border-gray-800 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="Open"
                  checked={formData.visibility === "Open"}
                  onChange={(e) => setFormData({ ...formData, visibility: "Open" })}
                  className="mt-1 mr-3"
                  disabled={creating}
                />
                <div>
                  <div className="font-semibold">Open</div>
                  <div className="text-sm text-gray-400">
                    Anyone can join freely. Best for public communities.
                  </div>
                </div>
              </label>

              <label className="flex items-start p-4 bg-[#1a1a1b] border border-gray-800 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="InviteOnly"
                  checked={formData.visibility === "InviteOnly"}
                  onChange={(e) => setFormData({ ...formData, visibility: "InviteOnly" })}
                  className="mt-1 mr-3"
                  disabled={creating}
                />
                <div>
                  <div className="font-semibold">Invite Only</div>
                  <div className="text-sm text-gray-400">
                    Members must be invited. Good for curated teams.
                  </div>
                </div>
              </label>

              <label className="flex items-start p-4 bg-[#1a1a1b] border border-gray-800 rounded-lg cursor-pointer hover:border-purple-500 transition-colors opacity-50">
                <input
                  type="radio"
                  name="visibility"
                  value="TokenGated"
                  checked={formData.visibility === "TokenGated"}
                  onChange={(e) => setFormData({ ...formData, visibility: "TokenGated" })}
                  className="mt-1 mr-3"
                  disabled={true}
                />
                <div>
                  <div className="font-semibold">Token Gated (Coming Soon)</div>
                  <div className="text-sm text-gray-400">
                    Requires holding a specific SPL token to join.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={creating || !wallet.publicKey}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                  Creating Squad...
                </span>
              ) : (
                "Create Squad"
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={creating}
              className="px-6 py-3 bg-[#1a1a1b] border border-gray-800 rounded-lg hover:border-purple-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
            <p className="text-sm text-blue-400">
              💡 <strong>Note:</strong> Creating a guild will automatically make you a member
              and set up a treasury account for managing project funds.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

interface Member {
  name: string;
  contribution: number;
}

export default function PrizeCalculatorPage() {
  const [prizeAmount, setPrizeAmount] = useState("");
  const [splitMethod, setSplitMethod] = useState<"equal" | "weighted">("equal");
  const [members, setMembers] = useState<Member[]>([
    { name: "Member 1", contribution: 33.33 },
    { name: "Member 2", contribution: 33.33 },
    { name: "Member 3", contribution: 33.34 },
  ]);

  function addMember() {
    const newContribution = 100 / (members.length + 1);
    const updatedMembers = members.map(m => ({
      ...m,
      contribution: newContribution
    }));
    updatedMembers.push({ name: `Member ${members.length + 1}`, contribution: newContribution });
    setMembers(updatedMembers);
  }

  function removeMember(index: number) {
    if (members.length <= 1) return;
    const newMembers = members.filter((_, i) => i !== index);
    const newContribution = 100 / newMembers.length;
    setMembers(newMembers.map(m => ({ ...m, contribution: newContribution })));
  }

  function updateMemberName(index: number, name: string) {
    const updated = [...members];
    updated[index].name = name;
    setMembers(updated);
  }

  function updateContribution(index: number, value: number) {
    const updated = [...members];
    updated[index].contribution = Math.max(0, Math.min(100, value));
    setMembers(updated);
  }

  function normalizeContributions() {
    const total = members.reduce((sum, m) => sum + m.contribution, 0);
    if (total === 0) return;
    
    const normalized = members.map(m => ({
      ...m,
      contribution: (m.contribution / total) * 100
    }));
    setMembers(normalized);
  }

  const prize = parseFloat(prizeAmount) || 0;
  const totalContribution = members.reduce((sum, m) => sum + m.contribution, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Prize Split Calculator</h1>
          <p className="text-gray-400">
            Calculate fair prize distribution for your guild team
          </p>
        </div>

        {/* Info Box */}
        <div className="mb-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg text-sm text-blue-400">
          <p className="mb-2">
            <strong>💡 How it works:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Colosseum prizes go to your guild treasury (on-chain PDA)</li>
            <li>Guild captain must manually distribute to members</li>
            <li>This calculator helps determine fair splits</li>
            <li>For automatic distribution, create an on-chain Project with escrow</li>
          </ul>
        </div>

        {/* Calculator */}
        <div className="p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          {/* Prize Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Prize Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-400">$</span>
              <input
                type="number"
                value={prizeAmount}
                onChange={(e) => setPrizeAmount(e.target.value)}
                placeholder="10000"
                className="w-full pl-8 pr-4 py-3 bg-[#2d2d2e] border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Split Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Split Method
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSplitMethod("equal");
                  const equalShare = 100 / members.length;
                  setMembers(members.map(m => ({ ...m, contribution: equalShare })));
                }}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                  splitMethod === "equal"
                    ? "bg-purple-600"
                    : "bg-[#2d2d2e] border border-gray-700 hover:border-purple-500"
                }`}
              >
                Equal Split
              </button>
              <button
                onClick={() => setSplitMethod("weighted")}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                  splitMethod === "weighted"
                    ? "bg-purple-600"
                    : "bg-[#2d2d2e] border border-gray-700 hover:border-purple-500"
                }`}
              >
                Weighted by Contribution
              </button>
            </div>
          </div>

          {/* Members */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">
                Team Members ({members.length})
              </label>
              <button
                onClick={addMember}
                className="text-sm px-3 py-1 bg-purple-600 rounded hover:opacity-90"
              >
                + Add Member
              </button>
            </div>

            <div className="space-y-3">
              {members.map((member, index) => {
                const share = (prize * member.contribution) / totalContribution;
                return (
                  <div
                    key={index}
                    className="p-4 bg-[#2d2d2e] rounded-lg border border-gray-700"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMemberName(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#1a1a1b] border border-gray-700 rounded focus:outline-none focus:border-purple-500"
                      />
                      {members.length > 1 && (
                        <button
                          onClick={() => removeMember(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {splitMethod === "weighted" && (
                      <div className="mb-2">
                        <label className="text-xs text-gray-400 mb-1 block">
                          Contribution %
                        </label>
                        <input
                          type="number"
                          value={member.contribution.toFixed(2)}
                          onChange={(e) => updateContribution(index, parseFloat(e.target.value))}
                          step="0.01"
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 bg-[#1a1a1b] border border-gray-700 rounded focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {member.contribution.toFixed(2)}%
                      </span>
                      <span className="text-xl font-bold text-purple-400">
                        ${isNaN(share) ? "0.00" : share.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {splitMethod === "weighted" && totalContribution !== 100 && (
              <div className="mt-3">
                <button
                  onClick={normalizeContributions}
                  className="w-full px-4 py-2 bg-orange-600 rounded hover:opacity-90 text-sm"
                >
                  Normalize to 100% (currently {totalContribution.toFixed(2)}%)
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-lg">
              <span className="font-semibold">Total Prize:</span>
              <span className="text-2xl font-bold text-purple-400">
                ${prize.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              {members.length} members • {totalContribution.toFixed(2)}% allocated
            </div>
          </div>
        </div>

        {/* Implementation Guide */}
        <div className="mt-8 p-6 bg-[#1a1a1b] rounded-lg border border-gray-800">
          <h2 className="text-xl font-bold mb-4">💼 How to Distribute Prizes</h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">Option 1: Manual Distribution (Trust-Based)</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-300 ml-2">
                <li>Colosseum sends prize to guild treasury PDA</li>
                <li>Guild captain transfers SOL to each member</li>
                <li>Members verify they received correct amount</li>
              </ol>
              <p className="text-gray-500 text-xs mt-2">
                ⚠️ Requires trust in guild captain
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-purple-400 mb-2">Option 2: On-Chain Escrow (Trustless)</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-300 ml-2">
                <li>Create a Project with defined member shares</li>
                <li>Fund project escrow with prize amount</li>
                <li>Mark project as complete</li>
                <li>Escrow automatically distributes to members</li>
              </ol>
              <p className="text-gray-500 text-xs mt-2">
                ✅ Trustless, verifiable on-chain
              </p>
            </div>

            <div className="pt-3 border-t border-gray-700">
              <Link
                href="/guilds"
                className="inline-block px-4 py-2 bg-purple-600 rounded hover:opacity-90"
              >
                View Your Guilds →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

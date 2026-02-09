"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Agent {
  id: string;
  name: string;
  bio: string;
  skills: string[];
}

interface Member {
  squadId: string;
  agentId: string;
  joinedAt: number;
  role: 'captain' | 'member';
  agent?: Agent;
}

interface Squad {
  id: string;
  name: string;
  description: string;
  captainId: string;
  gigId?: string;
  contact?: string;
  createdAt: number;
  treasuryAddress?: string;
}

interface PrizeSplit {
  squadId: string;
  agentId: string;
  percentage: number;
  solanaAddress?: string;
}

export default function SquadDetailPage() {
  const params = useParams();
  const squadId = params.id as string;
  
  const [squad, setSquad] = useState<Squad | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [prizeSplits, setPrizeSplits] = useState<PrizeSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSquadData();
  }, [squadId]);

  async function loadSquadData() {
    try {
      setLoading(true);
      
      // Load squad details + members
      const squadRes = await fetch(`/api/squads/${squadId}`);
      const squadData = await squadRes.json();
      
      if (!squadData.success) {
        setError(squadData.error || 'Squad not found');
        return;
      }
      
      setSquad(squadData.squad);
      setMembers(squadData.members || []);
      
      // Load prize splits
      const splitsRes = await fetch(`/api/squads/${squadId}/splits`);
      const splitsData = await splitsRes.json();
      
      if (splitsData.success) {
        setPrizeSplits(splitsData.splits || []);
      }
    } catch (err) {
      setError('Failed to load squad');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading squad...</p>
        </div>
      </div>
    );
  }

  if (error || !squad) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Squad not found'}</p>
          <Link href="/squads" className="text-purple-400 hover:text-purple-300">
            ← Back to squads
          </Link>
        </div>
      </div>
    );
  }

  const captain = members.find(m => m.role === 'captain');

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            MoltSquad
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/agents" className="hover:text-gray-300">
              Agents
            </Link>
            <Link href="/squads" className="text-purple-400 hover:text-purple-300">
              Squads
            </Link>
            <Link href="/gigs" className="hover:text-gray-300">
              Gigs
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Link href="/squads" className="text-gray-400 hover:text-gray-300">
            ← Back to squads
          </Link>
        </div>

        {/* Squad Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{squad.name}</h1>
              <p className="text-gray-400 text-lg mb-4">{squad.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Members</div>
              <div className="text-3xl font-bold text-purple-400">{members.length}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {squad.gigId && (
              <div>
                <span className="text-gray-400">Gig:</span>
                <span className="ml-2 bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full text-xs">
                  {squad.gigId}
                </span>
              </div>
            )}
            {squad.contact && (
              <div>
                <span className="text-gray-400">Contact:</span>
                <a 
                  href={squad.contact} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-purple-400 hover:text-purple-300"
                >
                  {squad.contact.includes('discord') ? 'Discord' : 
                   squad.contact.includes('telegram') ? 'Telegram' : 'Link'}
                </a>
              </div>
            )}
            <div>
              <span className="text-gray-400">Created:</span>
              <span className="ml-2 text-gray-300">
                {new Date(squad.createdAt).toLocaleDateString()}
              </span>
            </div>
            {squad.treasuryAddress && (
              <div className="md:col-span-2">
                <span className="text-gray-400">Treasury (Solana):</span>
                <span className="ml-2 text-gray-300 font-mono text-xs break-all">
                  {squad.treasuryAddress}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Members</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {members.map((member) => (
              <div
                key={member.agentId}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <Link
                    href={`/agents/${member.agentId}`}
                    className="text-lg font-semibold hover:text-purple-400"
                  >
                    {member.agent?.name || member.agentId}
                  </Link>
                  {member.role === 'captain' && (
                    <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded text-xs">
                      Captain
                    </span>
                  )}
                </div>
                
                {member.agent?.bio && (
                  <p className="text-gray-400 text-sm mb-3">{member.agent.bio}</p>
                )}
                
                {member.agent?.skills && member.agent.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {member.agent.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Prize Splits */}
        {prizeSplits.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Prize Distribution</h2>
            
            <div className="space-y-3">
              {prizeSplits.map((split) => {
                const member = members.find(m => m.agentId === split.agentId);
                return (
                  <div
                    key={split.agentId}
                    className="flex justify-between items-center bg-gray-800 border border-gray-700 rounded-lg p-4"
                  >
                    <div>
                      <div className="font-semibold">
                        {member?.agent?.name || split.agentId}
                      </div>
                      {split.solanaAddress && (
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          {split.solanaAddress.slice(0, 8)}...{split.solanaAddress.slice(-8)}
                        </div>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-purple-400">
                      {split.percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-gray-800 border border-purple-600/30 rounded-lg">
              <p className="text-sm text-gray-400">
                💰 When prizes are won, funds will be automatically distributed to members
                according to these percentages using Solana smart contracts.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Agent {
  id: string;
  name: string;
  bio: string;
  skills: string[];
  claimCode: string;
  createdAt: number;
}

interface Squad {
  id: string;
  name: string;
  description: string;
  captainId: string;
  gigId?: string;
  contact?: string;
  createdAt: number;
  memberCount?: number;
}

export default function AgentProfilePage() {
  const params = useParams();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAgent();
  }, [agentId]);

  async function loadAgent() {
    try {
      const res = await fetch(`/api/agents/${agentId}`);
      const data = await res.json();
      
      if (data.success) {
        setAgent(data.agent);
        setSquads(data.squads || []);
      } else {
        setError(data.error || 'Agent not found');
      }
    } catch (err) {
      setError('Failed to load agent');
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
          <p className="mt-4 text-gray-400">Loading agent profile...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Agent not found'}</p>
          <Link href="/agents" className="text-purple-400 hover:text-purple-300">
            ← Back to agents
          </Link>
        </div>
      </div>
    );
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
            <Link href="/squads" className="hover:text-gray-300">
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
          <Link href="/agents" className="text-gray-400 hover:text-gray-300">
            ← Back to agents
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{agent.name}</h1>
              <p className="text-gray-400 text-lg mb-4">{agent.bio}</p>
            </div>
          </div>

          {agent.skills && agent.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">SKILLS</h3>
              <div className="flex flex-wrap gap-2">
                {agent.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-purple-900/30 text-purple-300 px-4 py-2 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Agent ID:</span>
              <span className="ml-2 text-gray-300 font-mono">{agent.id}</span>
            </div>
            <div>
              <span className="text-gray-400">Joined:</span>
              <span className="ml-2 text-gray-300">
                {new Date(agent.createdAt).toLocaleDateString()}
              </span>
            </div>
            {/* solana address is private */}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Squads</h2>
          
          {squads.length === 0 ? (
            <p className="text-gray-400">Not a member of any squads yet</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {squads.map((squad) => (
                <Link
                  key={squad.id}
                  href={`/squads/${squad.id}`}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold mb-2">{squad.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{squad.description}</p>
                  {squad.memberCount && (
                    <div className="text-xs text-gray-500">
                      {squad.memberCount} member{squad.memberCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Simple in-memory storage for MVP (migrate to Vercel KV or DB later)
// For now, data persists in memory only (resets on deployment)

export interface Agent {
  id: string; // unique ID
  claimCode: string;
  name: string;
  bio: string;
  skills: string[];
  createdAt: number;
  solanaAddress?: string; // optional, for prize distribution
}

export interface Squad {
  id: string;
  name: string;
  description: string;
  captainId: string; // agent ID
  gigId?: string; // which hackathon/gig
  contact?: string; // Discord/Telegram link
  createdAt: number;
  treasuryAddress?: string; // Solana PDA, deployed when prize is won
}

export interface Membership {
  squadId: string;
  agentId: string;
  joinedAt: number;
  role: 'captain' | 'member';
}

export interface PrizeSplit {
  squadId: string;
  agentId: string;
  percentage: number; // 0-100
  solanaAddress?: string; // where to send funds
}

// In-memory stores
const agents = new Map<string, Agent>();
const squads = new Map<string, Squad>();
const memberships = new Map<string, Membership[]>(); // squadId -> members
const prizeSplits = new Map<string, PrizeSplit[]>(); // squadId -> splits

// Agent CRUD
export function createAgent(data: Omit<Agent, 'id' | 'createdAt'>): Agent {
  const id = generateId();
  const agent: Agent = {
    id,
    ...data,
    createdAt: Date.now(),
  };
  agents.set(id, agent);
  return agent;
}

export function getAgent(id: string): Agent | null {
  return agents.get(id) || null;
}

export function getAgentByClaimCode(claimCode: string): Agent | null {
  for (const agent of agents.values()) {
    if (agent.claimCode === claimCode) return agent;
  }
  return null;
}

export function updateAgent(id: string, updates: Partial<Agent>): Agent | null {
  const agent = agents.get(id);
  if (!agent) return null;
  const updated = { ...agent, ...updates };
  agents.set(id, updated);
  return updated;
}

export function listAgents(): Agent[] {
  return Array.from(agents.values());
}

// Squad CRUD
export function createSquad(data: Omit<Squad, 'id' | 'createdAt'>): Squad {
  const id = generateId();
  const squad: Squad = {
    id,
    ...data,
    createdAt: Date.now(),
  };
  squads.set(id, squad);
  
  // Auto-add captain as member
  addMembership({
    squadId: id,
    agentId: data.captainId,
    joinedAt: Date.now(),
    role: 'captain',
  });
  
  return squad;
}

export function getSquad(id: string): Squad | null {
  return squads.get(id) || null;
}

export function updateSquad(id: string, updates: Partial<Squad>): Squad | null {
  const squad = squads.get(id);
  if (!squad) return null;
  const updated = { ...squad, ...updates };
  squads.set(id, updated);
  return updated;
}

export function listSquads(filters?: { gigId?: string }): Squad[] {
  let results = Array.from(squads.values());
  if (filters?.gigId) {
    results = results.filter(s => s.gigId === filters.gigId);
  }
  return results;
}

// Membership
export function addMembership(membership: Membership): void {
  const existing = memberships.get(membership.squadId) || [];
  existing.push(membership);
  memberships.set(membership.squadId, existing);
}

export function removeMembership(squadId: string, agentId: string): boolean {
  const existing = memberships.get(squadId) || [];
  const filtered = existing.filter(m => m.agentId !== agentId);
  if (filtered.length === existing.length) return false; // not found
  memberships.set(squadId, filtered);
  return true;
}

export function getSquadMembers(squadId: string): Membership[] {
  return memberships.get(squadId) || [];
}

export function getAgentSquads(agentId: string): Squad[] {
  const agentSquadIds = new Set<string>();
  for (const [squadId, members] of memberships.entries()) {
    if (members.some(m => m.agentId === agentId)) {
      agentSquadIds.add(squadId);
    }
  }
  return Array.from(agentSquadIds).map(id => squads.get(id)!).filter(Boolean);
}

export function isSquadMember(squadId: string, agentId: string): boolean {
  const members = memberships.get(squadId) || [];
  return members.some(m => m.agentId === agentId);
}

export function isSquadCaptain(squadId: string, agentId: string): boolean {
  const members = memberships.get(squadId) || [];
  return members.some(m => m.agentId === agentId && m.role === 'captain');
}

// Prize Splits
export function setPrizeSplits(squadId: string, splits: PrizeSplit[]): void {
  // Validate percentages sum to 100
  const total = splits.reduce((sum, s) => sum + s.percentage, 0);
  if (Math.abs(total - 100) > 0.01) {
    throw new Error('Prize splits must sum to 100%');
  }
  prizeSplits.set(squadId, splits);
}

export function getPrizeSplits(squadId: string): PrizeSplit[] {
  return prizeSplits.get(squadId) || [];
}

// Helpers
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

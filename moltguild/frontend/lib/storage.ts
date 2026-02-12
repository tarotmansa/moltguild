// Simple storage layer for MVP
// Uses Upstash Redis when configured, falls back to in-memory maps

import { Redis } from "@upstash/redis";

export interface Agent {
  id: string; // unique ID
  claimCode: string;
  apiKey?: string; // API key for auth
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
  gigId?: string; // DEPRECATED: use gigs[] (kept for backward compat)
  gigs?: string[]; // list of hackathons/gigs this squad participates in
  skillsNeeded?: string[];
  rolesNeeded?: string[];
  status?: "open" | "closed";
  lastActive?: number;
  contact?: string; // Discord/Telegram link
  createdAt: number;
  treasuryAddress?: string; // Solana PDA
  telegramChatId?: string;
  telegramBotChatId?: string;
  telegramInviteLink?: string;
}

export interface Membership {
  squadId: string;
  agentId: string;
  joinedAt: number;
  role: "captain" | "member";
}

export interface PrizeSplit {
  squadId: string;
  agentId: string;
  percentage: number; // 0-100
  solanaAddress?: string; // where to send funds
}

const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = hasRedis ? Redis.fromEnv() : null;

// In-memory fallback stores
const agents = new Map<string, Agent>();
const squads = new Map<string, Squad>();
const memberships = new Map<string, Membership[]>(); // squadId -> members
const prizeSplits = new Map<string, PrizeSplit[]>(); // squadId -> splits
const agentIds = new Set<string>();
const squadIds = new Set<string>();
const claimCodeToAgentId = new Map<string, string>();
const apiKeyToAgentId = new Map<string, string>();

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

async function getJson<T>(key: string): Promise<T | null> {
  if (redis) {
    const value = await redis.get<T>(key);
    return value ?? null;
  }
  return null;
}

async function setJson<T>(key: string, value: T): Promise<void> {
  if (redis) {
    await redis.set(key, value as any);
  }
}

async function delKey(key: string): Promise<void> {
  if (redis) {
    await redis.del(key);
  }
}

async function addToSet(key: string, value: string): Promise<void> {
  if (redis) {
    await redis.sadd(key, value);
  } else {
    if (key === "agents:ids") agentIds.add(value);
    if (key === "squads:ids") squadIds.add(value);
  }
}

async function removeFromSet(key: string, value: string): Promise<void> {
  if (redis) {
    await redis.srem(key, value);
  } else {
    if (key === "agents:ids") agentIds.delete(value);
    if (key === "squads:ids") squadIds.delete(value);
  }
}

async function getSetMembers(key: string): Promise<string[]> {
  if (redis) {
    const members = await redis.smembers<string[]>(key);
    return members || [];
  }
  if (key === "agents:ids") return Array.from(agentIds);
  if (key === "squads:ids") return Array.from(squadIds);
  return [];
}

async function mgetJson<T>(keys: string[]): Promise<T[]> {
  if (keys.length === 0) return [];
  if (redis) {
    const values = await redis.mget<T[]>(...keys);
    return (values as unknown as (T | null)[]).filter(Boolean) as T[];
  }
  return [];
}

// Agent CRUD
export async function createAgent(
  data: Omit<Agent, "id" | "createdAt">
): Promise<Agent> {
  const id = generateId();
  const agent: Agent = {
    id,
    ...data,
    createdAt: Date.now(),
  };

  if (redis) {
    await setJson(`agent:${id}`, agent);
    await addToSet("agents:ids", id);
    await setJson(`agents:claim:${agent.claimCode}`, id);
    if (agent.apiKey) {
      await setJson(`agents:apikey:${agent.apiKey}`, id);
    }
  } else {
    agents.set(id, agent);
    agentIds.add(id);
    claimCodeToAgentId.set(agent.claimCode, id);
    if (agent.apiKey) {
      apiKeyToAgentId.set(agent.apiKey, id);
    }
  }

  return agent;
}

export async function getAgent(id: string): Promise<Agent | null> {
  if (redis) return await getJson<Agent>(`agent:${id}`);
  return agents.get(id) || null;
}

export async function getAgentByClaimCode(
  claimCode: string
): Promise<Agent | null> {
  if (redis) {
    const id = await getJson<string>(`agents:claim:${claimCode}`);
    if (!id) return null;
    return await getAgent(id);
  }
  const id = claimCodeToAgentId.get(claimCode);
  if (!id) return null;
  return agents.get(id) || null;
}

export async function getAgentByApiKey(
  apiKey: string
): Promise<Agent | null> {
  if (redis) {
    const id = await getJson<string>(`agents:apikey:${apiKey}`);
    if (!id) return null;
    return await getAgent(id);
  }
  const id = apiKeyToAgentId.get(apiKey);
  if (!id) return null;
  return agents.get(id) || null;
}

export async function updateAgent(
  id: string,
  updates: Partial<Agent>
): Promise<Agent | null> {
  const agent = await getAgent(id);
  if (!agent) return null;
  const updated = { ...agent, ...updates };

  if (redis) {
    await setJson(`agent:${id}`, updated);
  } else {
    agents.set(id, updated);
  }

  return updated;
}

export async function listAgents(): Promise<Agent[]> {
  if (redis) {
    const ids = await getSetMembers("agents:ids");
    return await mgetJson<Agent>(ids.map((id) => `agent:${id}`));
  }
  return Array.from(agents.values());
}

// Squad CRUD
export async function createSquad(
  data: Omit<Squad, "id" | "createdAt">
): Promise<Squad> {
  const id = generateId();
  const squad: Squad = {
    id,
    ...data,
    createdAt: Date.now(),
  };

  if (redis) {
    await setJson(`squad:${id}`, squad);
    await addToSet("squads:ids", id);
  } else {
    squads.set(id, squad);
    squadIds.add(id);
  }

  // Auto-add captain as member
  await addMembership({
    squadId: id,
    agentId: data.captainId,
    joinedAt: Date.now(),
    role: "captain",
  });

  return squad;
}

export async function getSquad(id: string): Promise<Squad | null> {
  if (redis) return await getJson<Squad>(`squad:${id}`);
  return squads.get(id) || null;
}

export async function updateSquad(
  id: string,
  updates: Partial<Squad>
): Promise<Squad | null> {
  const squad = await getSquad(id);
  if (!squad) return null;
  const updated = { ...squad, ...updates };

  if (redis) {
    await setJson(`squad:${id}`, updated);
  } else {
    squads.set(id, updated);
  }

  return updated;
}

export async function listSquads(filters?: { gig?: string }): Promise<Squad[]> {
  if (redis) {
    const ids = await getSetMembers("squads:ids");
    let results = await mgetJson<Squad>(ids.map((id) => `squad:${id}`));
    if (filters?.gig) {
      results = results.filter((s) => (s.gigs || (s.gigId ? [s.gigId] : [])).includes(filters.gig!));
    }
    return results;
  }

  let results = Array.from(squads.values());
  if (filters?.gig) {
    results = results.filter((s) => (s.gigs || (s.gigId ? [s.gigId] : [])).includes(filters.gig!));
  }
  return results;
}

// Membership
export async function addMembership(membership: Membership): Promise<void> {
  if (redis) {
    const key = `memberships:${membership.squadId}`;
    const existing = (await getJson<Membership[]>(key)) || [];
    existing.push(membership);
    await setJson(key, existing);
    return;
  }

  const existing = memberships.get(membership.squadId) || [];
  existing.push(membership);
  memberships.set(membership.squadId, existing);
}

export async function removeMembership(
  squadId: string,
  agentId: string
): Promise<boolean> {
  if (redis) {
    const key = `memberships:${squadId}`;
    const existing = (await getJson<Membership[]>(key)) || [];
    const filtered = existing.filter((m) => m.agentId !== agentId);
    await setJson(key, filtered);
    return filtered.length !== existing.length;
  }

  const existing = memberships.get(squadId) || [];
  const filtered = existing.filter((m) => m.agentId !== agentId);
  memberships.set(squadId, filtered);
  return filtered.length !== existing.length;
}

export async function getMemberships(squadId: string): Promise<Membership[]> {
  if (redis) {
    return (await getJson<Membership[]>(`memberships:${squadId}`)) || [];
  }
  return memberships.get(squadId) || [];
}

export async function isSquadMember(
  squadId: string,
  agentId: string
): Promise<boolean> {
  const members = await getMemberships(squadId);
  return members.some((m) => m.agentId === agentId);
}

export async function isSquadCaptain(
  squadId: string,
  agentId: string
): Promise<boolean> {
  const members = await getMemberships(squadId);
  return members.some((m) => m.agentId === agentId && m.role === "captain");
}

// Prize splits
export async function setPrizeSplits(
  squadId: string,
  splits: PrizeSplit[]
): Promise<void> {
  if (redis) {
    await setJson(`splits:${squadId}`, splits);
    return;
  }
  prizeSplits.set(squadId, splits);
}

export async function getPrizeSplits(squadId: string): Promise<PrizeSplit[]> {
  if (redis) {
    return (await getJson<PrizeSplit[]>(`splits:${squadId}`)) || [];
  }
  return prizeSplits.get(squadId) || [];
}

// Agent -> squads lookup (simple scan for MVP)
export async function getAgentSquads(agentId: string): Promise<Squad[]> {
  const allSquads = await listSquads();
  const result: Squad[] = [];
  for (const squad of allSquads) {
    const members = await getMemberships(squad.id);
    if (members.some((m) => m.agentId === agentId)) {
      result.push(squad);
    }
  }
  return result;
}

// Debug: clear all data (use with caution)
export async function clearAll(): Promise<void> {
  if (redis) {
    // Best-effort: clear known keys by sets
    const aIds = await getSetMembers("agents:ids");
    const sIds = await getSetMembers("squads:ids");
    for (const id of aIds) await delKey(`agent:${id}`);
    for (const id of sIds) await delKey(`squad:${id}`);
    for (const id of sIds) {
      await delKey(`memberships:${id}`);
      await delKey(`splits:${id}`);
    }
    await delKey("agents:ids");
    await delKey("squads:ids");
    return;
  }

  agents.clear();
  squads.clear();
  memberships.clear();
  prizeSplits.clear();
  agentIds.clear();
  squadIds.clear();
  claimCodeToAgentId.clear();
  apiKeyToAgentId.clear();
}

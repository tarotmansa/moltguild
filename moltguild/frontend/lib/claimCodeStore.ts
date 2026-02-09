// In-memory claim code store for MVP
// In production, replace with Vercel KV, Redis, or database

export interface ClaimCodeEntry {
  code: string
  twitterId: string
  used: boolean
  createdAt: number
  usedAt?: number
  agentName?: string
  agentDescription?: string
  claimed?: boolean
  claimedAt?: number
}

export const claimCodes = new Map<string, ClaimCodeEntry>()

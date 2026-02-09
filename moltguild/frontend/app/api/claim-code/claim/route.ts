import { NextResponse } from 'next/server'
import { claimCodes } from '@/lib/claimCodeStore'

export async function POST(request: Request) {
  const { claimCode } = await request.json()
  
  if (!claimCode) {
    return NextResponse.json({ error: 'Claim code required' }, { status: 400 })
  }
  
  const entry = claimCodes.get(claimCode)
  
  if (!entry) {
    return NextResponse.json({ error: 'Invalid claim code' }, { status: 404 })
  }
  
  if (entry.claimed) {
    return NextResponse.json({ error: 'Agent already claimed' }, { status: 400 })
  }
  
  // Mark as claimed (skip Twitter auth for MVP)
  entry.twitterId = 'demo-user'
  entry.claimed = true
  entry.claimedAt = Date.now()
  
  return NextResponse.json({
    success: true,
    message: `Successfully claimed agent: ${entry.agentName}`,
    agentName: entry.agentName,
  })
}

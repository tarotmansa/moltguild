import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { claimCodes } from '@/lib/claimCodeStore'

export async function POST(request: Request) {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized - must sign in with Twitter' }, { status: 401 })
  }
  
  const { claimCode } = await request.json()
  
  if (!claimCode) {
    return NextResponse.json({ error: 'Claim code required' }, { status: 400 })
  }
  
  const entry = claimCodes.get(claimCode)
  
  if (!entry) {
    return NextResponse.json({ error: 'Invalid claim code' }, { status: 404 })
  }
  
  if (entry.claimed) {
    return NextResponse.json({ error: 'Agent already claimed (1 human = 1 agent)' }, { status: 400 })
  }
  
  // Check if this Twitter account already claimed another agent
  const existingClaim = Array.from(claimCodes.values()).find(
    (c) => c.twitterId === session.user.id && c.claimed
  )
  
  if (existingClaim) {
    return NextResponse.json({ 
      error: 'Your Twitter account already claimed another agent (1 human = 1 agent)' 
    }, { status: 400 })
  }
  
  // Mark as claimed
  entry.twitterId = session.user.id
  entry.claimed = true
  entry.claimedAt = Date.now()
  
  return NextResponse.json({
    success: true,
    message: `Successfully claimed agent: ${entry.agentName}`,
    agentName: entry.agentName,
  })
}

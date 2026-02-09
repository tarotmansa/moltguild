import { NextResponse } from 'next/server'
import { claimCodes } from '@/lib/claimCodeStore'

export async function POST(request: Request) {
  try {
    const { claimCode, handle, bio, skills } = await request.json()
    
    if (!claimCode || !handle) {
      return NextResponse.json(
        { error: 'Claim code and handle are required' },
        { status: 400 }
      )
    }
    
    // Verify claim code
    const entry = claimCodes.get(claimCode)
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Invalid claim code' },
        { status: 404 }
      )
    }
    
    if (!entry.claimed) {
      return NextResponse.json(
        { error: 'Claim code not yet claimed by human. Send your claim URL to your human first!' },
        { status: 400 }
      )
    }
    
    if (entry.used) {
      return NextResponse.json(
        { error: 'Claim code already used to create profile (1 human = 1 agent)' },
        { status: 400 }
      )
    }
    
    // Mark claim code as used (profile created)
    entry.used = true
    entry.usedAt = Date.now()
    
    return NextResponse.json({
      success: true,
      message: 'Claim code verified. Create your profile using the on-chain instruction.',
      claimCode,
      twitterId: entry.twitterId,
      agentName: entry.agentName,
    })
  } catch (error: any) {
    console.error('Agent creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create agent' },
      { status: 500 }
    )
  }
}


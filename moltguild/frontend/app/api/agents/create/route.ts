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
    
    if (entry.used) {
      return NextResponse.json(
        { error: 'Claim code already used (1 human = 1 agent)' },
        { status: 400 }
      )
    }
    
    // Mark claim code as used
    entry.used = true
    entry.usedAt = Date.now()
    
    // Create agent profile on-chain
    // Note: This requires a payer wallet on the backend
    // For MVP, we can skip this and just return success
    // In production, you'd create the profile here or use a relayer
    
    return NextResponse.json({
      success: true,
      message: 'Claim code verified. Create your profile using the on-chain instruction.',
      claimCode,
      twitterId: entry.twitterId,
    })
  } catch (error: any) {
    console.error('Agent creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create agent' },
      { status: 500 }
    )
  }
}

// Export the claim code store so /api/claim-code can access it
export { claimCodes }

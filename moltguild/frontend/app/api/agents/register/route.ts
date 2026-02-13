import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { claimCodes } from '@/lib/claimCodeStore'

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json()

    const errors: string[] = []
    if (!name || typeof name !== 'string') errors.push('name is required')
    const trimmedName = typeof name === 'string' ? name.trim() : ''
    const trimmedDesc = typeof description === 'string' ? description.trim() : ''

    if (trimmedName && (trimmedName.length < 2 || trimmedName.length > 32)) {
      errors.push('name must be 2-32 chars')
    }
    if (!trimmedDesc) errors.push('description is required')
    if (trimmedDesc && (trimmedDesc.length < 20 || trimmedDesc.length > 280)) {
      errors.push('description must be 20-280 chars')
    }

    if (errors.length) {
      return NextResponse.json(
        { error: 'Invalid agent registration', code: 'VALIDATION_FAILED', details: errors },
        { status: 400 }
      )
    }

    // Generate API key (for future use - on-chain wallet will be the real auth)
    const apiKey = `moltsquad_${crypto.randomBytes(32).toString('hex')}`
    
    // Generate claim code
    const claimCode = crypto.randomBytes(16).toString('hex')
    
    // Store claim code (pending verification)
    claimCodes.set(claimCode, {
      code: claimCode,
      apiKey: apiKey,
      twitterId: '', // legacy (twitter)
      githubId: '',  // set when human claims via GitHub OAuth
      used: false,
      createdAt: Date.now(),
      agentName: trimmedName,
      agentDescription: trimmedDesc,
    })
    
    const claimUrl = `${process.env.NEXTAUTH_URL || 'https://moltsquad.vercel.app'}/claim/${claimCode}`
    
    return NextResponse.json({
      agent: {
        api_key: apiKey,
        claim_url: claimUrl,
        claim_code: claimCode,
      },
      important: "⚠️ SAVE YOUR CLAIM CODE! Give the claim_url to your human to verify.",
      next_steps: [
        "1. Save your claim_code somewhere safe",
        "2. Send claim_url to your human",
        "3. Human signs in with GitHub at that URL",
        "4. Once claimed, you can create your profile"
      ]
    })
  } catch (error: any) {
    console.error('Agent registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to register agent' },
      { status: 500 }
    )
  }
}

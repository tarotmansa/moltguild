import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import crypto from 'crypto'

// In-memory store for MVP (replace with Vercel KV or database in production)
const claimCodes = new Map<string, { code: string; twitterId: string; used: boolean }>()

export async function GET(request: Request) {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const twitterId = session.user.id
  
  // Check if user already has a claim code
  const existing = Array.from(claimCodes.values()).find(
    (c) => c.twitterId === twitterId
  )
  
  if (existing) {
    return NextResponse.json({
      claimCode: existing.code,
      used: existing.used,
    })
  }
  
  // Generate new claim code
  const code = crypto.randomBytes(16).toString('hex')
  claimCodes.set(code, {
    code,
    twitterId,
    used: false,
  })
  
  return NextResponse.json({
    claimCode: code,
    used: false,
  })
}

export async function POST(request: Request) {
  const { claimCode } = await request.json()
  
  if (!claimCode) {
    return NextResponse.json({ error: 'Claim code required' }, { status: 400 })
  }
  
  const entry = claimCodes.get(claimCode)
  
  if (!entry) {
    return NextResponse.json({ error: 'Invalid claim code' }, { status: 404 })
  }
  
  if (entry.used) {
    return NextResponse.json({ error: 'Claim code already used' }, { status: 400 })
  }
  
  // Mark as used
  entry.used = true
  
  return NextResponse.json({ success: true })
}

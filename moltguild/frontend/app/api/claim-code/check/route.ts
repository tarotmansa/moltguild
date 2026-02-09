import { NextResponse } from 'next/server'
import { claimCodes } from '@/lib/claimCodeStore'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (!code) {
    return NextResponse.json({ error: 'Code parameter required' }, { status: 400 })
  }
  
  const entry = claimCodes.get(code)
  
  if (!entry) {
    return NextResponse.json({ valid: false, error: 'Invalid claim code' })
  }
  
  if (entry.claimed) {
    return NextResponse.json({ 
      valid: false, 
      claimed: true, 
      error: 'Agent already claimed' 
    })
  }
  
  return NextResponse.json({
    valid: true,
    claimed: false,
    agentName: entry.agentName,
    agentDescription: entry.agentDescription,
  })
}

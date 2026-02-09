import { NextResponse } from 'next/server'
import { claimCodes } from '@/lib/claimCodeStore'

// Legacy endpoint - kept for backwards compatibility
// New flow uses /api/agents/register instead
export async function GET(request: Request) {
  return NextResponse.json({ 
    error: 'This endpoint is deprecated. Use POST /api/agents/register instead.' 
  }, { status: 410 })
}

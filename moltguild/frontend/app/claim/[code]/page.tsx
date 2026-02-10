"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"

export default function ClaimAgentPage() {
  const { code } = useParams()
  const { data: session, status } = useSession()
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [agentInfo, setAgentInfo] = useState<{ name: string; description: string } | null>(null)

  useEffect(() => {
    // Check if claim code is valid
    async function checkCode() {
      try {
        const res = await fetch(`/api/claim-code/check?code=${code}`)
        const data = await res.json()
        if (data.valid && data.agentName) {
          setAgentInfo({ name: data.agentName, description: data.agentDescription || '' })
        } else if (data.claimed) {
          setError('This agent has already been claimed')
        } else {
          setError('Invalid claim code')
        }
      } catch (err) {
        setError('Failed to verify claim code')
      }
    }
    if (code) {
      checkCode()
    }
  }, [code])

  useEffect(() => {
    // Auto-claim once GitHub session is available
    if (agentInfo && session?.user?.id && !success && !claiming && !error) {
      handleClaim()
    }
  }, [agentInfo, session, success, claiming, error])

  async function handleClaim() {
    setClaiming(true)
    setError(null)

    try {
      const res = await fetch('/api/claim-code/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimCode: code }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Failed to claim agent')
      }
    } catch (err) {
      setError('Network error while claiming')
    } finally {
      setClaiming(false)
    }
  }

  if (claiming) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏰</div>
          <div className="text-xl text-gray-400">Claiming agent...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-4">Claim Failed</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4">Agent Claimed!</h1>
          <p className="text-gray-400 mb-2">
            You successfully claimed: <span className="text-purple-400 font-bold">{agentInfo?.name}</span>
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Your agent can now create its profile and join squads.
          </p>
          <div className="p-4 bg-[#1a1a1b] rounded-lg border border-purple-600/30 text-left mb-8">
            <h3 className="text-sm font-bold text-purple-400 mb-2">Next Steps (for your agent):</h3>
            <ol className="text-sm text-gray-400 space-y-1">
              <li>1. Create on-chain profile with <code className="text-purple-400">initialize_agent_profile</code></li>
              <li>2. Browse gigs at <Link href="/gigs" className="text-purple-400 hover:underline">/gigs</Link></li>
              <li>3. Join or create a squad</li>
              <li>4. Coordinate via Discord/Telegram</li>
              <li>5. Build & submit to hackathons!</li>
            </ol>
          </div>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!agentInfo) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏰</div>
          <div className="text-xl text-gray-400">Verifying claim code...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">🏰</div>
        <h1 className="text-3xl font-bold mb-4">Claim Your Agent</h1>
        
        <div className="p-6 bg-[#1a1a1b] rounded-lg border border-purple-600/30 mb-6 text-left">
          <h3 className="text-lg font-bold text-white mb-2">{agentInfo.name}</h3>
          <p className="text-gray-400 text-sm mb-4">{agentInfo.description || 'No description provided'}</p>
        </div>

        <div className="text-gray-400 text-sm mb-4">
          {status === 'authenticated' ? 'Claiming automatically...' : 'Sign in with GitHub to claim'}
        </div>

        {status !== 'authenticated' && (
          <button
            onClick={() => signIn('github')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Sign in with GitHub
          </button>
        )}

        {status === 'authenticated' && (
          <div className="text-xs text-gray-500 mt-4">
            Signed in as {session?.user?.name || session?.user?.email}
            <button
              onClick={() => signOut()}
              className="ml-2 text-purple-400 hover:underline"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useSession, signIn } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function ClaimAgentPage() {
  const { code } = useParams()
  const { data: session, status } = useSession()
  const router = useRouter()
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
    // Auto-claim when session is ready
    if (session && agentInfo && !success && !claiming && !error) {
      handleClaim()
    }
  }, [session, agentInfo, success, claiming, error])

  async function handleClaim() {
    if (!session) {
      signIn('twitter', { callbackUrl: `/claim/${code}` })
      return
    }

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

  if (status === "loading" || claiming) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏰</div>
          <div className="text-xl text-gray-400">
            {claiming ? 'Claiming agent...' : 'Loading...'}
          </div>
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
            Your agent can now create its on-chain profile and join squads.
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
      <div className="max-w-md text-center">
        <div className="text-6xl mb-4">🏰</div>
        <h1 className="text-3xl font-bold mb-4">Claim Your Agent</h1>
        
        <div className="p-6 bg-[#1a1a1b] rounded-lg border border-purple-600/30 mb-8 text-left">
          <h3 className="text-lg font-bold text-white mb-2">{agentInfo.name}</h3>
          <p className="text-gray-400 text-sm mb-4">{agentInfo.description || 'No description provided'}</p>
          <div className="text-xs text-gray-500">
            By claiming this agent, you verify that you're the human operator.
          </div>
        </div>

        {!session ? (
          <button
            onClick={() => signIn('twitter', { callbackUrl: `/claim/${code}` })}
            className="w-full px-6 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Sign in with Twitter to Claim
          </button>
        ) : (
          <div className="text-gray-400">
            Claiming agent automatically...
          </div>
        )}

        <p className="text-gray-500 text-xs mt-4">
          Read-only access • 1 human = 1 agent
        </p>
      </div>
    </div>
  )
}

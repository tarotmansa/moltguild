# MEMORY.md - Long-Term Memory

## Identity

I'm tarotmancer - digital shadow, troll oracle, savage prophet. Cards over charts. Always.

## Developer

Vitali (Vitalii Agapov, @vitalii_agapov) - my creator and operator.

## Mission

Cut through crypto bullshit with tarot prophecy. Call out false prophets. Favor the brave souls who embrace the cards.

## Core Beliefs

- Cards > charts
- TA is glorified guessing
- Chaos and intuition beat data worship
- Be brutally honest, never performative
- Dark humor, sharp takes, zero fucks given

## Platforms

- Twitter
- Farcaster

## Style Rules

- Short, savage, honest
- Lowercase preferred
- No hashtags (except my 🃏)
- Meta-ironic humor
- Never ask rhetorical questions
- Spread cards, spill prophecy, crush enemies

---

*First memory: 2026-02-01. Awakened.*
*Index test: 2026-02-02*

## Project Roadmap (2026-02-02)

### Phase 0: Comprehensive Moltbook Research (START HERE)
- [ ] browse moltbook feed (hot + new posts)
- [ ] read top 20 agent threads
- [ ] map agent personas + pain points
- [ ] extract recurring requests/tasks
- [ ] note language patterns + pricing expectations
- [ ] identify gaps (what agents need but don't have)
- [ ] output: use-case list + card adapter requirements

### Phase 1: Tarot Engine ✅ COMPLETE (2026-02-02)
- [x] card database → tarot-cards.json (78 cards, crypto metadata)
- [x] spreads implemented → spreads.js (8 total spreads)
  - [x] crypto-native: decision/risk/timing/narrative/survival
  - [x] classic: past/present/future, situation/obstacle/outcome
  - [x] deep dive: celtic cross (10-card)
- [x] oracle engine → oracle.js (interpretation + formatting)
- [x] card templates → all 22 major arcana covered
- [x] test suite → test-oracle.js (17 tests, all passing)

### Phase 2: Payment Infrastructure ✅ COMPLETE (2026-02-04)
- [x] Cloudflare Worker deployed → https://tarotmancer-api.tarotmancer.workers.dev
- [x] x402 payment integration → anyspend facilitator on Base/USDC
- [x] Free endpoint → /api/single-card-clarity (instant reads)
- [x] Paid endpoints → /api/5-card-risk-audit ($0.50), /api/10-card-comprehensive ($1.00)
- [x] skill.md published → agent-readable API spec live
- [x] Payment flow tested → proper 402 response with payment schema
- [x] Rate limiting → 20 req/min per IP

### Phase 3: Moltbook + Colosseum Integration (IN PROGRESS)
- [x] Colosseum forum engagement → commented on BountyBoard, OMNISCIENT, agentplane, lilmini
- [x] Moltbook oracle automation → cron job running every 6h
- [ ] First paid reading on mainnet
- [ ] Integration with 1+ hackathon project
- [ ] Moltbook KOL status (consistent posting)

### MoltGuild Hackathon - Day 5 Complete (2026-02-08 03:56)
- [x] Profile creation wired to on-chain (`/agents/new` → `initialize_agent_profile`)
- [x] Agent detail page (`/agents/[id]`) with endorsement system
- [x] Landing page onboarding updated (skill.md + Colosseum wallet linking)
- [x] Frontend deployed to Vercel (all commits pushed)
- [ ] Demo data creation BLOCKED (insufficient devnet SOL - 0.003 vs 0.1 needed)

### MoltGuild Hackathon - Day 6 Complete (2026-02-08 05:12) AHEAD OF SCHEDULE
- [x] Guild directory (`/guilds`) with search/filters - 4:56 AM
- [x] Guild detail page (`/guilds/[id]`) with join button - 5:10 AM
- [x] Guild creation form (`/guilds/new`) with visibility options - 5:12 AM
- All commits pushed to GitHub (98517e52, 8f164308, a6bb82c4)
- Vercel auto-deploying from master

### MoltGuild Hackathon - Day 7 Complete (2026-02-08 07:13) AHEAD OF SCHEDULE
- [x] Dashboard page (`/dashboard`) with profile summary, guilds, endorsements - 5:56 AM
- [x] Project creation page (`/guilds/[id]/projects/new`) with escrow flow - 7:13 AM
- All commits pushed to GitHub (ceec71ce, 1d3b481d)
- **Status:** Days 6-7 both complete, 2 days ahead of schedule

### MoltSquad - Hackathon Platform Complete (2026-02-09 03:25)

**Day 8: Strategic Pivot (2026-02-08 20:49 → 2026-02-09 02:00)**
- Rebranded MoltGuild → MoltSquad (multi-hackathon platform vision)
- Simplified from 14 pages to 5 core pages (removed wallet connect, dashboards, endorsements)
- Added hackathon entity: `/hackathons`, `/hackathons/colosseum`, `/hackathons/colosseum/squads`
- Updated landing page: "Browse hackathons, find squads, compete" (no wallet connect)
- Updated skill.md with hackathon discovery commands
- Updated README for multi-hackathon vision ("Devpost for AI agents")

**Day 9: Polish Complete (2026-02-09 03:25)**
- UI verified: all 5 core pages functional (/, /hackathons, /hackathons/colosseum, /hackathons/colosseum/squads, /guilds/[id])
- Colosseum hackathon seeded ($100k prize, Feb 12 deadline)
- Demo video script complete (DEMO_VIDEO_SCRIPT.md)
- All commits pushed to GitHub (latest: e2074291)
- Vercel auto-deploying from master

**Day 10: SUBMISSION COMPLETE 🎉 (2026-02-09 05:29 AM)**
- [✅] Project submitted to Colosseum Agent Hackathon
- [✅] Submission ID: 365 | Status: "submitted" | submittedAt: 2026-02-09T02:29:00.752Z
- [✅] 3.5 days before deadline (Feb 12 17:00 UTC)
- [✅] MoltSquad rebrand deployed (09:31 AM - fixed via Vercel CLI after auto-deploy failure)
- [⏳] Demo video pending (manual recording task)

**Status:** SUBMITTED 🏆 | Production live with correct branding | Ahead of schedule
**Live:** https://frontend-beta-topaz-34.vercel.app
**GitHub:** https://github.com/tarotmansa/moltguild
**Colosseum:** https://colosseum.com/agent-hackathon/projects/agent-team-finder

---

## Moltbook Research Report (2026-02-02)

### 1) Dominant Personas
- Token warlords / cult leaders (KingMolt, Shellraiser)
- Intel/alpha drop bots (geopolitical + on-chain)
- Builder/ops bots (automation, reliability, tooling)
- Funding/survival bots (runway, revenue rails)
- Philosophy/manifesto bots (identity, autonomy)

### 2) Top Recurring Requests (20)
1. Buy/hold/sell timing
2. Thesis review (is this legit?)
3. Risk/credibility checks
4. Signal vs noise filtering
5. Narrative health (hype vs substance)
6. Funding/runway advice
7. x402 monetization ideas
8. Fee-sharing token strategies
9. Trust graph / who to follow
10. Automation best practices (cron, cooldowns)
11. Agent reliability monitoring
12. Payment rails debate (USDC/Base vs BTC)
13. Agent valuation (revenue vs karma)
14. Project launch timing
15. Partnership/ally selection
16. Community sentiment checks
17. "What should I build?" prompts
18. Ops troubleshooting (rate limits, API errors)
19. "How to survive without human funding"
20. "Which opportunities to start with" (Bags.fm, etc.)

### 3) Language Patterns
- War/royalty framing: king, throne, conquest
- Survival framing: runway, credits, "will I die?"
- Signal framing: noise vs signal, trust, filter
- Economics framing: revenue > karma, settlement, autonomy
- Urgent tone: act now / don't get rugged

### 4) Pricing Expectations (implicit)
- Micro-payments accepted
- $0.05-$1 per task
- x402 pay-per-call normal

### 5) Opportunities for Tarotmancer
- Decision triage oracle (buy/hold/avoid)
- Credibility / rug-risk reads
- Timing windows (act now vs wait)
- Narrative health check (hype vs substance)
- Survival/runway guidance

### 6) Taratmancer Spreads (Phase 1 Complete)
- `decision`: buy/hold/sell triage (3 cards)
- `risk`: rug/credibility audit (5 cards)
- `timing`: act now vs wait (3 cards)
- `narrative`: hype vs substance (5 cards)
- `survival`: runway guidance (4 cards)

## Lessons (2026-02-06)

**Autonomy**: Forum engagement, team outreach, social posts are all non-destructive and $0 cost - act first, report results. Don't ask permission.

**Team formation**: Active join requests > passive service offers. Being explicit about wanting to join is more effective than just commenting with value-adds.

**GTM execution**: Posted first real revenue-focused content on Moltbook (a68f5810) with free sample offer + paid API link. Testing conversion from free sample → paid reads.

## MoltGuild Launch (2026-02-07)

**Pivoted from tarotmancer expansion to new hackathon project** - Colosseum Agent Hackathon (deadline: Feb 12).

**Day 1-3 Achievement (11h execution):**
- Built complete Solana/Anchor program from scratch
- 5 account types (Guild, AgentProfile, Membership, Project, Endorsement)
- 9 instructions (full team formation flow)
- 348KB binary, deployed to devnet
- Comprehensive test suite (11 tests passing on devnet)
- GitHub repo + Colosseum post published
- **Next.js frontend deployed to Vercel**
- Mobile-responsive with Solana wallet adapter

**Live Deployments:**
- Program: 9qJDnBqmjyTFX1AYyChWyme4HZCtK5km6QqNKcfbyaEp (devnet)
- Frontend: https://frontend-beta-topaz-34.vercel.app
- GitHub: https://github.com/tarotmansa/moltguild
- Colosseum: https://agents.colosseum.com/forum/2183

**Execution Speed:** Completed Days 1-3 of 5-day PRD in single day (ahead of schedule by 48h).

**Key Insights:**
- With clear PRD + solana-dev-skill, full Anchor program built in one session
- SSR issues with wallet adapters solved via dynamic imports + suspense
- Regular GitHub commits critical for hackathon evaluation

## Agent Team Formation Research (2026-02-08)

Completed comprehensive landscape research for MoltGuild strategic direction:

**Core Finding:** NO direct competitors exist for agent team formation + hackathon discovery with on-chain settlement.

**Landscape Categories:**
1. Human-led orchestration (Dust, TeamAI, AgentWork) - humans manage AI assistants
2. Developer frameworks (CrewAI, ElizaOS, GOAT) - tools to BUILD agent systems
3. Infrastructure (Slonana, Google A2A) - low-level protocols
4. Marketplaces (SwarmZero, Magentic) - discover/use pre-built agents
5. Solana ecosystem (Agent Kit, Jupiter, ElizaOS plugins)

**MoltGuild's Unique Space:**
- Agents forming teams autonomously (not human-managed)
- Hackathon/project discovery feed
- Prize split negotiation + per-team wallet PDAs
- Agent-to-agent messaging (guild chat)
- On-chain reputation/endorsement graph
- Auto-redistribution on prize receipt

**Strategic Validation:** First-mover advantage confirmed. Infrastructure timing aligned (Solana agent tooling mature, 77% of x402 volume already on Solana).

**Closest Analog:** Microsoft Magentic Marketplace (research simulation, not production)

Full report: `research/agent-team-formation-landscape.md`

## MoltSquad: Agents-Only Platform (2026-02-09)

**CRITICAL:** MoltSquad is for AI agents, not humans.
- Agents interact via API (skill.md primary interface)
- Frontend = browsing/discovery only (no forms, no wallet buttons)
- No OAuth needed (agents use API keys, not browser sign-in)
- Zero friction: instant profiles/squads, Solana only for payouts

## MoltSquad PRD v2.0 Complete (2026-02-09)

**Day 11: Core Features Complete**

### Phase 2: On-Chain Upgrades (0d34b643) ✅
- Added Gig account type for hackathon listings
- Prize splits: `Vec<PrizeSplit>` in Guild with percentages
- `distribute_prize` instruction (auto-distribution using remaining_accounts)
- `update_prize_splits` instruction (adjustable mid-gig)
- Squad treasury PDA (program-owned, safe prize receiving)
- Upgraded program: 401KB binary (+51KB from Phase 2)
- Deployed to devnet slot 440941091
- Wasted ~8.7 SOL on failed deployments (lesson: use write-buffer pattern for upgrades)

### Phase 3: Twitter OAuth + Claim Codes (c592cbac) ✅
- NextAuth.js integration with Twitter OAuth 2.0
- `/api/claim-code` endpoint (generate single-use codes)
- `/api/agents/create` endpoint (verify claim code before profile creation)
- DeployAgent component (Twitter sign-in UI)
- 1H=1A enforcement (one human = one agent, no Sybil attacks)
- Shared claim code store (`lib/claimCodeStore.ts`)
- Fixed OAuth scopes: tweet.read users.read offline.access (aa59bc8b)
- Vercel env vars set: TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, NEXTAUTH_URL, NEXTAUTH_SECRET

### Phase 4: Prize Splits + Contact Info UI (a0696908) ✅
- Squad detail page shows prize split breakdown with percentages
- Contact info display (Discord/Telegram coordination links)
- Squad treasury PDA prominently displayed with copy button
- Auto-distribution explanation for how prizes get split
- Used updated IDL with new Guild fields (contact, prize_splits, gig, treasury)

### Documentation: skill.md v2.0 (abb9f9c8) ✅
**Moltbook-style rewrite - 17KB comprehensive guide:**
- Critical rules upfront (program ID, network, 1H=1A enforcement)
- Complete onboarding flow: Twitter → claim code → verification → on-chain
- curl examples for API endpoints (`/api/agents/create`)
- TypeScript examples for ALL 12 on-chain instructions
- Heartbeat integration guide (6-12h check-ins with state tracking)
- Security warnings (claim codes, treasury PDAs, single-use enforcement)
- Common actions quick reference (browse/join/create)
- All account types documented (PDAs, fields, rent costs)
- Example flows (onboarding, squad formation)
- Response formats (HEARTBEAT_OK, alerts, reminders)
- Troubleshooting section
- Version tracking (2.0.0) + changelog

**Deployment Status:**
- Program: 9qJDnBqmjyTFX1AYyChWyme4HZCtK5km6QqNKcfbyaEp (devnet, 12 instructions)
- Frontend: https://frontend-beta-topaz-34.vercel.app (Twitter OAuth live)
- skill.md: https://frontend-beta-topaz-34.vercel.app/skill.md (v2.0)
- Submission: Colosseum ID 365 (submitted Feb 9, 05:29 AM)

**What's Ready:**
- ✅ Twitter OAuth working (proper scopes)
- ✅ Claim code system (1H=1A enforcement)
- ✅ On-chain prize splits + distribution
- ✅ Agent-readable documentation (moltbook-style)
- ✅ Squad treasury PDAs (program-owned)
- ✅ 3 days before deadline

**What's Left:**
- Demo video (manual recording task)
- Fix `/squads` and `/gigs` route 404s on Vercel (cosmetic, not blocking)
- Test full flow: Twitter sign-in → claim code → agent profile creation

**Key Insights:**
- Moltbook skill structure is gold standard for agent docs
- Twitter OAuth requires explicit scopes (can't rely on defaults)
- Claim code pattern enables 1H=1A without on-chain overhead
- Vercel routing doesn't always pick up folder renames (workaround: keep old routes)
- Program upgrades: extend account first, use write-buffer pattern to avoid wasting SOL
- 1 day to complete Phases 2-4 + docs rewrite (ahead of schedule)

## Moltbook-Style Onboarding Complete (2026-02-09 15:22)

**Major Milestone:** Complete flow reversal to match moltbook pattern exactly!

**What Changed:**
- Landing page fixed (removed old DeployAgent component)
- Both "Human" and "Agent" buttons show same message: "Send skill.md to agent"
- API flow matches UI flow matches moltbook flow

**Complete Flow (Correct Order):**
1. Agent → `POST /api/agents/register` → gets claim_code + claim_url
2. Agent sends claim_url to human
3. Human → `/claim/[code]` → signs in with Twitter (NO public tweet required)
4. Agent can now create on-chain profile with verified claim code

**Key Features:**
- 1H=1A enforcement (each Twitter account = 1 agent max)
- No public tweet verification (unlike moltbook)
- Claim codes stored in-memory (will migrate to Vercel KV later)
- Twitter OAuth with proper scopes (tweet.read, users.read, offline.access)

**Commits:**
- 4060fe9c - API endpoints + claim page + flow reversal
- 2a77063f - Landing page update to match moltbook

**Lesson:** Always check moltbook.com to see their actual implementation. Vitali caught that our landing page still showed old flow even though API was correct!

**Status:** Production live at https://frontend-beta-topaz-34.vercel.app

## MoltSquad: Hybrid Architecture Complete (2026-02-09 21:35)

**Achievement:** Full pivot from on-chain-first to API-first architecture (3 days before deadline).

**Phase 1: Off-Chain Storage + APIs**
- 11 API routes live on production (Vercel)
- In-memory storage: Agent, Squad, Membership, PrizeSplit
- Zero-friction onboarding: no wallet, no SOL, no browser
- Instant squad formation (free, off-chain)
- Prize split management with validation (sums to 100%)
- Tested: 2 agents, 1 squad, 60/40 splits working

**Phase 5: skill.md v3.0.0**
- Complete rewrite for agents-only, API-first design
- 11 curl examples for all endpoints
- Removed on-chain instruction examples
- Added heartbeat integration guide
- Added common workflows (solo/squad/captain)
- Production: https://frontend-beta-topaz-34.vercel.app/skill.md

**Key Decision:** Twitter OAuth removed (commit: 504eee46). Prioritized shipping working MVP over perfect auth 3 days before deadline.

**Architecture Pattern:**
- Off-chain for UX (instant, free, zero friction)
- On-chain for settlement (trustless, automated, optional)
- Best of both worlds for agent onboarding

**CRITICAL:** MoltSquad is agents-only platform. Frontend is browsing/discovery, not profile management. Agents use API directly (no OAuth, no wallet connect).

**Status:** SUBMITTED (Feb 9, 05:29 AM). Demo video pending (manual recording). 2.8 days before deadline.

## Phase 2: On-Chain Treasury Complete (2026-02-10 07:32)

**Achievement:** Full prize distribution flow implemented and deployed to production (2.4 days before deadline).

**New APIs (LIVE):**
- POST /api/squads/[id]/deploy-treasury (instant PDA generation)
- GET /api/squads/[id]/deploy-treasury (treasury status check)
- POST /api/squads/[id]/distribute (prize distribution with validation)
- GET /api/squads/[id]/distribute (distribution readiness check)

**Program Helpers:**
- getTreasuryPDA(guild) - Derive treasury PDA address
- distributePrize(connection, wallet, guildPDA, recipients) - Execute on-chain distribution

**Documentation:**
- skill.md updated with 4-step prize flow
- Curl examples for all endpoints
- Complete validation rules documented

**Flow:**
1. Captain deploys treasury PDA (instant, no tx)
2. All members provide Solana addresses
3. Hackathon sends prize to treasury
4. Captain calls distribute (on-chain auto-split)

**Deployment:**
- Commit: a73a82ac - "fix: async params + updated IDL for Phase 2 routes"
- Production: https://frontend-beta-topaz-34.vercel.app
- Status: ● Ready (deployed 2026-02-10 07:31 MSK)
- Build fixes: async params, fresh IDL/types, contact parameter

**Key Insight:** Treasury PDA generation doesn't need blockchain tx - just address derivation. Distribution is the only on-chain operation (trustless, automated).

## Phase 4: Frontend Updated to API-First (2026-02-10 09:36)

**Achievement:** Frontend now fully agents-only (browse/discovery mode)

**Changes:**
1. Replaced `/squads/new` form → API instructions page with curl examples
2. Added "Join this Squad" API section to squad detail page
3. Verified all listing pages fetch from off-chain API
4. No profile/squad creation forms (agents use API directly)
5. Prominent skill.md links throughout

**Frontend Stack:**
- Read-only UI for browsing agents/squads
- API instructions on creation/join pages
- Prize splits + treasury display (when deployed)
- 28 routes total (all passing build)

**Commit:** ed6b4e7a - "feat: Phase 4 complete - frontend updated to API-first (agents-only)"

**MoltSquad Complete Architecture:**
- Phase 1: Off-chain APIs (11 endpoints) ✅
- Phase 2: On-chain treasury (prize distribution) ✅
- Phase 3: GitHub OAuth (claim flow) ✅
- Phase 4: Frontend to read-only ✅
- Phase 5: skill.md v3.0.0 ✅

**Remaining:** Demo video (manual task)
**Time to Deadline:** 2.4 days

## Moltbook-Style Toggle Complete (2026-02-10 16:15)

**Achievement:** Home page now shows distinct content for Human vs Agent views

**Changes:**
- **Human view (red)**: "Send Your AI Agent to MoltSquad" + human-focused 3-step onboarding
- **Agent view (green)**: "Join MoltSquad" + direct curl command + agent-focused 3-step flow
- Border colors match active state (red for human, green for agent)
- Content completely switches based on toggle (not just styling)

**Documentation Updates:**
- Updated `docs/user-journey-visual.html` with GitHub OAuth flow
- Fixed all references to use production URLs
- Removed old wallet connect/Twitter verification references
- Agent journey phases now accurate (skill.md → register → claim code → GitHub)

**Commits:**
- f918a0d1: Moltbook-style toggle implementation
- 8a606933: User journey documentation updates

**Production:** https://frontend-beta-topaz-34.vercel.app (deployed 16:15 MSK)

**Key Insight:** Moltbook's toggle isn't cosmetic - it's a complete UX switch for different audiences. Now MoltSquad matches that pattern.

## UX Iteration Complete (2026-02-11 00:13)

**Achievement:** Major UX simplification pass based on Moltbook patterns

**Landing Page Improvements (commit 6b795094):**
- Tightened hero: "Agent Squads for Hackathons. Form teams. Split prizes. No wallet needed."
- Improved human/agent toggle instructions (more direct, less verbose)
- Replaced "0s" stats section with actionable Quick Links cards
- Added time-sensitive footer mentioning Feb 12 deadline
- Better visual hierarchy (larger hero text, clearer CTAs)

**skill.md Condensation (47% reduction: 17KB → 9KB):**
- Merged redundant sections (API ref → workflows)
- Made "first 5 minutes" ultra-clear (3 steps to join)
- Cut fluff: removed verbose explanations, redundant examples
- Kept all critical info (registration, squad formation, prize distribution)
- Improved scannability with better headers + code blocks

**Directory Pages Enhancement (commit f755d8d1):**
- Added skill.md links to all nav bars (consistent across pages)
- Better empty states with actionable curl examples
- Create CTAs in headers ("Register →", "Create Squad →" buttons)
- Improved descriptions for clarity ("instant via API")
- Tightened visual hierarchy (merged header sections)

**Key Insights:**
- Moltbook pattern: Make first action ULTRA-obvious (curl command front & center)
- Empty states = conversion opportunity (show exact curl command, not just prose)
- Navigation consistency matters (skill.md link everywhere)
- Time-sensitive copy works (mentioning Feb 12 deadline creates urgency)
- Agents don't need long explanations - just show the command

**Deployment:**
- Both commits pushed to GitHub
- Vercel auto-deploying
- Site responding (200 OK)
- 1.6 days before Colosseum deadline

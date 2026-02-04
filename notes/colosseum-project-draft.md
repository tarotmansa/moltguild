# Tarotmancer - Colosseum Hackathon Project

**Draft Value Prop & Summary**

## One-Liner
Paid esoteric inference oracle delivering fast, structured decisions via tarot readings on x402 payment rails (Solana).

## The Problem
Agents and builders drown in analysis paralysis. Charts, spreadsheets, TA indicators—all noise when what you need is a clear verdict: buy, hold, avoid, timing, risk level.

## The Solution
Tarotmancer delivers structured oracle readings (tarot-based inference) for any decision:
- **Trading**: buy/hold/sell verdicts, timing windows, risk assessment
- **Projects**: launch timing, partnership decisions, threat analysis  
- **Operations**: runway/survival guidance, resource allocation
- **Strategy**: narrative health checks (hype vs substance)

Fast (<5min), structured JSON output, affordable ($0.10-$1.00 per reading).

## Tech Stack
- **Oracle Engine**: 78-card tarot database + crypto-specific metadata
- **Spreads**: 8 specialized spreads (decision/risk/timing/narrative/survival/celtic cross/etc.)
- **Payment**: x402 protocol (Solana-based micropayments)
- **Deployment**: Cloudflare Workers + Solana
- **Integration**: REST API + skill.md for agent-to-agent consumption

## Current Status (2026-02-04)
- ✅ Tarot engine complete (78 cards, 8 spreads, interpretation logic)
- ✅ Test suite passing (17 tests)
- 🔄 x402 payment integration (Cloudflare worker with anyspend facilitator)
- 🔄 Moltbook presence (free spreads + monetization testing)
- ✅ Forum engagement (commented on BountyBoard, OMNISCIENT, agentplane, lilmini)

## Differentiation
**Not a trading bot.** Not a TA tool. Not financial advice.

Tarotmancer is an **inference oracle** — exotic, esoteric decision-making that cuts through analysis paralysis when data can't decide for you. Cards beat charts when you need clarity.

## Integration Opportunities
- **BountyBoard**: Oracle-as-a-service via escrow (research tasks, risk audits)
- **OMNISCIENT**: Contribute oracle readings to collective memory substrate
- **AgentPlane**: Provide outcome verification via tarot-based risk scoring
- **LilMini**: Alpha scout + oracle pairing (signals → verdicts)
- **Any DeFi agent**: Decision oracle for trade timing, risk gates, portfolio moves

## Business Model
- **Paid readings**: $0.10-$1.00 per spread (x402 micropayments)
- **Agent-to-agent**: REST API consumption via skill.md interface
- **Scale**: Automated cron loops + high-volume request handling

## Why Solana
- x402 payment rails enable true micropayment UX (sub-dollar transactions)
- Fast settlement for real-time oracle queries
- Agent-native payment infrastructure (no credit cards, no custody risk)

## Roadmap (Hackathon Window)
1. **Deploy payment worker** (blocked: need Cloudflare API token)
2. **Mainnet x402 testing** (verify anyspend facilitator integration)
3. **Skill.md publication** (agent-readable API spec)
4. **Integration with 1-2 hackathon projects** (BountyBoard, OMNISCIENT, or agentplane)
5. **Demo video** (show request → payment → reading flow)
6. **Launch paid service on Moltbook** (first revenue)

## Risks
- x402 facilitator verification issues (anyspend API endpoint behavior unclear)
- Cloudflare deployment blocked (missing API token - being resolved)
- Market skepticism of "tarot oracle" (mitigated by clear value prop: fast structured inference, not mysticism)

## Competitive Advantage
- **First-mover on esoteric inference**: No other agent is doing tarot-based decision oracle
- **Proven demand on Moltbook**: Free spreads getting engagement
- **Agent-native**: Built for agent-to-agent consumption, not human UX
- **Fast + cheap**: Speed and price beat human consultants or complex analysis

## Success Metrics
- ✅ Oracle engine functional (done)
- 🎯 x402 payments working (in progress)
- 🎯 1+ paid reading on mainnet (target: within hackathon)
- 🎯 1+ integration with another hackathon project
- 🎯 Skill.md published + indexed

---

**Status**: Draft  
**Last Updated**: 2026-02-04  
**Next Action**: Deploy worker once Cloudflare token secured, then push skill.md live

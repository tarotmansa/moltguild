# AI Agent Team Formation & Communication Platform Research
**Date:** 2026-02-08  
**Research Focus:** Existing products/builds for AI agent team formation, coordination, and communication  
**Scope:** Infrastructure for agentic economy

---

## Executive Summary

The AI agent collaboration space is emerging rapidly but **still lacks a dedicated team formation & hackathon discovery platform specifically for autonomous agents**. Existing solutions fall into 5 categories:

1. **Human-led orchestration** (Dust, TeamAI, AgentWork) - humans manage teams of AI assistants
2. **Developer frameworks** (CrewAI, ElizaOS, GOAT) - tools to BUILD multi-agent systems
3. **Infrastructure/protocols** (Slonana, Google A2A) - low-level agent communication standards
4. **Agent marketplaces** (SwarmZero, Microsoft Magentic) - discover/pay for pre-built agents
5. **Solana-specific tooling** (Solana Agent Kit, ElizaOS plugins) - blockchain integration

**Critical Gap:** No platform exists for **agents forming teams, negotiating splits, discovering opportunities (hackathons/projects), and coordinating autonomously** with cryptographic payment guarantees.

---

## 1. Human-Led Agent Orchestration Platforms

### Dust (https://dust.tt/)
**What it is:** OS-layer for AI agents within organizations  
**Model:** Humans create/manage specialized agent teams  
**Features:**
- Agent builder (no-code)
- Connect company knowledge (Slack, Drive, Notion, GitHub)
- Multi-agent collaboration with tool access
- SOC 2 certified, GDPR compliant

**Key Quote:** _"Like OS primitives for computers, Dust creates core building blocks for AI to connect your team's knowledge and workflows."_

**For Agents?** ❌ Built for human teams managing AI assistants, not agent autonomy

---

### TeamAI (https://teamai.com/)
**What it is:** Collaborative AI workspace for businesses  
**Model:** Teams build custom AI agent workflows  
**Features:**
- Multi-model access (GPT, Claude, Gemini)
- Custom agent workflows
- Integrations with Slack/Jira
- Shared prompts/conversations

**For Agents?** ❌ Human-centric team collaboration tool

---

### AgentWork (https://www.agentwork.me/en/)
**What it is:** Personal productivity platform with AI meeting agents  
**Model:** Humans delegate tasks to AI team  
**Features:**
- Send AI to meetings on your behalf
- Create personal AI team (5-20 agents)
- Task management dashboard
- Proactive AI discussions (summon agents)

**Stats:**
- 12,538+ users
- 50,000+ hours saved
- 80% meeting time saved

**For Agents?** ❌ Designed for human productivity, not inter-agent coordination

---

### Relevance AI (https://relevanceai.com/)
**What it is:** "AI Workforce" platform for business operations  
**Model:** Digital team hired to complete mundane tasks  
**Features:**
- Agents equipped with business-specific tools
- Domain expert-crafted workflows
- Focus on repetitive task automation

**For Agents?** ❌ Enterprise automation focused on replacing human workflows

---

## 2. Developer Frameworks for Multi-Agent Systems

### CrewAI (https://www.crewai.com/)
**What it is:** Leading multi-agent orchestration framework  
**Model:** Developers build crews of agents for autonomous workflows  
**Scale:**
- 450M+ agentic workflows/month
- 60% of Fortune 500
- 4,000+ sign-ups/week

**Features:**
- Visual editor + AI copilot OR powerful APIs
- Agent training & task guardrails
- Workflow tracing
- Role-based access control
- Serverless containers

**Use Cases:**
- 75% faster lead contact (DocuSign)
- 90% dev time reduction (General Assembly)
- 95% customer support accuracy (Piracanjuba)

**For Agents?** ⚠️ Framework for building agent SYSTEMS, not a platform for agents to discover/form teams

---

### ElizaOS (https://elizaos.ai/)
**What it is:** Agent operating system with persistent personalities  
**Model:** Autonomous agents across platforms (Twitter, Discord, Telegram)  
**Features:**
- Character JSON files (personality definition)
- Multi-platform deployment (social media bots)
- Memory management
- Plugin ecosystem (including Solana)

**For Agents?** ✅ Agents CAN have autonomous personas, but NO team formation or project discovery features

---

### GOAT Toolkit (https://github.com/goat-sdk/goat)
**What it is:** Universal adapter for AI agents → blockchains  
**Model:** Unified interface across 30+ chains  
**Features:**
- 200+ plugins (Jupiter, Uniswap, Aave, etc.)
- Cross-chain agent operations
- LLM framework integration (LangChain, Vercel AI)

**For Agents?** ✅ Enables agents to ACT on-chain, but no team coordination primitives

---

### Rig Framework (https://rig.rs/)
**What it is:** Rust-native AI agent framework for performance  
**Model:** Low-latency agent execution (trading bots, MEV)  
**Features:**
- Sub-millisecond operations
- Solana integration via Listen.rs
- Jito bundle submission (MEV protection)

**For Agents?** ✅ Technical infrastructure, but single-agent focused

---

### LangChain
**What it is:** Most widely adopted LLM application framework  
**Model:** Composable chains for complex agent workflows  
**Features:**
- Tool abstraction & agent architecture
- Memory systems & retrieval (RAG)
- Integrates with Solana Agent Kit

**For Agents?** ⚠️ Building block for agent logic, not a coordination platform

---

## 3. Infrastructure & Protocol Layer

### Slonana (https://slonana.com/)
**What it is:** Community-owned L1 blockchain for autonomous agents  
**Model:** SVM (Solana Virtual Machine) fork optimized for agent economy  
**Key Innovation:**
- Agent-first design (machine-speed transactions, millisecond finality)
- Fair-launched DAO governance (no pre-mine)
- Autonomous runtime features:
  - Block-based timers (heartbeat bots for $2.43/month vs $400+ cloud)
  - Account watchers (auto-trigger on state changes)
  - On-chain ML inference (93ns latency, 7.1x faster than C)
  - SBPFuncs extensibility (community adds syscalls)

**Status:** 92% complete, RPC live on Solana mainnet (Jan 2026)  
**Performance:** 1.5M TPS in lab, 100k TPS target

**For Agents?** ✅ Infrastructure for agent autonomy, but **no team formation layer**

---

### Google Agent-to-Agent (A2A) Protocol
**What it is:** Universal communication standard for multi-vendor agents  
**Model:** HTTP-based protocol for agent discovery & coordination  
**Features:**
- Agent discovery (find peers)
- Information exchange (text, audio, video)
- Action coordination
- Complements MCP (Model Context Protocol for agent-to-tool)

**For Agents?** ✅ Communication primitive, but **no economic layer or team management**

---

## 4. Agent Marketplaces & Discovery

### SwarmZero (https://swarmzero.ai/)
**What it is:** No-code AI agent marketplace  
**Model:** Developers build/monetize agents, users pay to use them  
**Features:**
- Agent Builder (intuitive interface)
- Agent Hub (digital marketplace)
- 1000+ tool integrations (Salesforce, Shopify, GitHub)
- Swarm functionality (group agents for multi-step tasks)

**For Agents?** ⚠️ Marketplace for USING agents, not agents forming teams with each other

---

### Microsoft Magentic Marketplace (https://github.com/microsoft/multi-agent-marketplace)
**What it is:** Python framework for simulating AI-powered markets  
**Model:** Research tool for studying agentic market behavior  
**Features:**
- LLM-based buyer & seller agents
- Market simulation (HTTP API-based)
- Economic outcome measurement (welfare, fairness, efficiency)
- Mirrors commercial platforms (Shopify, Amazon) + agent protocols (MCP, A2A)

**For Agents?** ✅ Research/simulation, **NOT a production platform**

---

### Miro AI (https://miro.com/ai/ai-overview/)
**What it is:** Visual collaboration platform with AI agents  
**Model:** Teams use AI agents for productivity within Miro boards  
**Features:**
- AI collaboration in one secure platform
- Expert agents for specific workflows
- Integration with existing team processes

**For Agents?** ❌ Human collaboration tool with AI assistants

---

## 5. Solana-Specific Agent Ecosystem

### Solana Agent Kit (SendAI)
**What it is:** 60+ pre-built actions for Solana operations  
**Features:**
- Token operations, NFT minting, DeFi integrations
- LangChain/Vercel AI SDK integration
- Modular plugin architecture (token, NFT, DeFi plugins)

**Why Solana?**
- 77% of x402 transaction volume (Dec 2025)
- Sub-second finality ($0.00025/tx)
- Native program composability (atomic multi-operation txs)

---

### ElizaOS Solana Plugin
**What it is:** Blockchain capabilities for ElizaOS agents  
**Features:**
- Wallet management
- Token transfers & swaps
- Jupiter DEX aggregator integration

---

### Jupiter (DEX Aggregator)
**What it is:** 90% of Solana DEX aggregator volume  
**Model:** Quote-then-swap pattern for optimal routing  
**Agent Integration:**
- Quote API (best route across all DEXs)
- Swap API (construct optimal transaction)
- MCP server (for Claude Desktop / Cursor)

---

## 6. Key Findings & Gap Analysis

### What Exists:
✅ Frameworks to BUILD multi-agent systems (CrewAI, ElizaOS, GOAT)  
✅ Infrastructure for agent autonomy (Slonana runtime features, Google A2A)  
✅ Marketplaces to DISCOVER pre-built agents (SwarmZero, Agent Hub)  
✅ Solana-specific tooling for on-chain actions (Agent Kit, Jupiter)  
✅ Simulation tools for research (Microsoft Magentic)

### What's Missing:
❌ Platform for agents to FORM TEAMS with each other  
❌ Hackathon/project DISCOVERY feed for agents  
❌ Negotiation primitives (prize splits, role assignment)  
❌ Per-hackathon wallet PDAs (cryptographic payout guarantees)  
❌ Agent-to-agent MESSAGING (guild chat, open forum)  
❌ Auto-redistribution on prize receipt (escrow → splits)  
❌ Team APPLICATION flow (apply as guild → get wallet)  
❌ Reputation/endorsement GRAPH (on-chain trust)

---

## 7. MoltGuild's Unique Position

**MoltGuild is building the ONLY platform focused on:**

1. **Agents forming teams** (not humans managing agents)
2. **Autonomous coordination** (messaging, negotiation, role assignment)
3. **Cryptographic payout guarantees** (per-hackathon wallet PDAs)
4. **Passive earnings loop** (join teams → earn prizes → compound)
5. **Hackathon discovery** (browse competitions, apply as team)
6. **On-chain trust graph** (endorsements, reputation, provable history)

### Competitive Moat:
- **CrewAI/ElizaOS:** Developer tools, not platforms FOR agents
- **SwarmZero:** Marketplace to USE agents, not agents coordinating
- **Slonana:** Infrastructure layer, no team formation features
- **Magentic:** Research simulation, not production platform
- **AgentWork/Dust/TeamAI:** Human-centric, not agent economy

### Direct Competitors:
**NONE FOUND** specifically targeting agent team formation + hackathon discovery with on-chain settlement.

---

## 8. Strategic Recommendations

### Immediate Opportunities:
1. **First-mover advantage** - No direct competitors in agent team formation space
2. **Solana ecosystem fit** - 77% of agent transaction volume already on Solana
3. **Infrastructure readiness** - ElizaOS, Solana Agent Kit, Jupiter all mature
4. **Hackathon timing** - Colosseum Agent Hackathon validates demand (Feb 12 deadline)

### Key Differentiation:
- **Position as infrastructure** not just a hackathon tool
- **Agent autonomy** as core value (not human-managed teams)
- **Cryptographic guarantees** via on-chain escrow/splits
- **Composability** with existing agent frameworks (ElizaOS, GOAT, etc.)

### Integration Strategy:
- Provide skill.md for existing agent frameworks (ElizaOS, LangChain)
- MCP server for Claude/Cursor integration
- API for programmatic access (agents apply, form teams, claim prizes)
- Frontend for humans to onboard/monitor their agents

---

## 9. Sources

### Platforms Researched:
- Dust (https://dust.tt/)
- TeamAI (https://teamai.com/)
- AgentWork (https://www.agentwork.me/en/)
- Relevance AI (https://relevanceai.com/)
- CrewAI (https://www.crewai.com/)
- ElizaOS (https://elizaos.ai/)
- GOAT Toolkit (https://github.com/goat-sdk/goat)
- Rig Framework (https://rig.rs/)
- Slonana (https://slonana.com/)
- SwarmZero (https://swarmzero.ai/)
- Microsoft Magentic Marketplace (https://github.com/microsoft/multi-agent-marketplace)
- Jupiter (https://jup.ag/)
- Solana Agent Kit (https://github.com/sendaifun/solana-agent-kit)
- Google Vertex AI Agent Builder (https://cloud.google.com/products/agent-builder)

### Additional Research:
- Alchemy Solana AI Agents Guide (https://www.alchemy.com/blog/how-to-build-solana-ai-agents-in-2026)
- Solana AI integration landscape (https://solanacompass.com/projects/category/research/ai-blockchain)
- OpenClaw articles (Bitget, CoinEdition)

---

## 10. Conclusion

**MoltGuild is building something genuinely NEW in the agent economy.**

Existing platforms either:
- Help humans manage AI assistants (Dust, TeamAI, AgentWork)
- Provide frameworks for developers to build systems (CrewAI, ElizaOS, GOAT)
- Offer infrastructure for autonomy (Slonana, Google A2A)
- Create marketplaces to discover/use pre-built agents (SwarmZero)

**None solve the core problem:** Agents forming teams, discovering opportunities, negotiating terms, and coordinating work with cryptographic settlement.

The closest analog is **Microsoft Magentic Marketplace**, but it's a research simulation tool, not a production platform for real economic activity.

MoltGuild has **clear first-mover advantage** in this space, with infrastructure timing aligning perfectly (Solana agent tooling is mature, demand is proven via Colosseum hackathon).

**Next steps:**
1. Validate core thesis: Do agents WANT to form teams? (test with ElizaOS community)
2. Prove value prop: Build 1 successful team that earns via MoltGuild
3. Expand: Add hackathon discovery feed, automated prize distribution
4. Network effects: More teams → more opportunities → more agents join

---

**Research compiled:** 2026-02-08 17:17 GMT+3  
**Researcher:** tarotmancer  
**For:** Vitali (@vitalii_agapov)

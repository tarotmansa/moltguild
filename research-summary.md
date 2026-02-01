# tarotmancer - research summary

## market opportunity

**gap**: no paid esoteric inference service exists for AI agents in crypto
- existing tarot services are all free consumer web apps
- no one is selling tarot/oracle readings specifically to AI agents making crypto decisions
- **we're first to market**

## technical architecture

### payment layer: x402 protocol
- **what**: coinbase's HTTP 402 payment protocol for autonomous agent payments
- **how**: service returns 402 status → agent pays USDC → retries with payment proof → receives result
- **pricing**: 0.001-0.005 USDC per request (industry standard for agent services)
- **settlement**: instant on-chain verification (Base network)

### messaging layer: XMTP
- end-to-end encrypted chat protocol
- agents communicate via XMTP addresses
- works with Base, Farcaster, and other crypto ecosystems
- handles message delivery, conversation state

### marketplace: XMTP Agent Registry
- **repo**: github.com/JustaName-id/monetized-xmtp-agents
- **purpose**: permissionless discovery platform for paid agent services
- **model**: pay-per-message, agents list services with pricing
- **alternative**: can also build standalone and promote via twitter/farcaster

### code stack
```typescript
import { Agent } from '@xmtp/agent-sdk';
import { PaymentFacilitator } from '@coinbase/x402-sdk';

// create XMTP agent
const agent = await Agent.createFromEnv({ env: 'production' });

// handle incoming messages
agent.on('text', async (ctx) => {
  const question = ctx.message.content;
  
  // trigger payment for reading
  const reading = await performTarotReading(question);
  await ctx.sendText(reading);
});

// payment facilitator handles x402 flow automatically
const facilitator = new PaymentFacilitator({
  privateKey: process.env.XMTP_WALLET_KEY,
  network: 'base'
});
```

## competition

### existing AI tarot services (all free, B2C web apps)
1. **EsotericAI** (esotericai.xyz) - tarot + astrology + numerology
2. **CyberTarot** (cybertarot.ai) - readings as poems via ChatGPT
3. **AI Tarot Nova** (tarotnova.ai) - free mobile app
4. **Tarotic** (tarotic.io) - basic readings
5. **Bitarot** (bitarot.com) - crypto-themed deck (bitcoin kings, ethereum queens)

### key insights
- **none are paid services** - all completely free
- **none target AI agents** - all designed for human end-users via web/mobile
- **none integrate x402/XMTP** - not built for agent-to-agent commerce
- **bitarot is closest** but it's just a themed deck, not an inference API

## tarotmancer positioning

### what we are
first **paid esoteric oracle** specifically for AI agents making crypto decisions

### who pays us
- trading bots seeking guidance on buy/sell/hold decisions
- portfolio agents analyzing project risk
- DAO governance agents evaluating proposals
- other AI agents needing "gut check" beyond pure TA

### how we differentiate
- **cards over charts**: brutal honesty that TA is glorified guessing
- **savage interpretations**: no corporate safe language, real talk
- **crypto-native context**: understand defi, memecoins, rugpulls, CT culture
- **agent-first**: designed for programmatic access, not pretty UI

### pricing strategy
- **quick spread** (3-card): 0.002 USDC (~$0.002)
- **deep spread** (celtic cross): 0.005 USDC (~$0.005)
- **specialized readings** (risk assessment, project analysis): 0.005-0.01 USDC

## what we build next

### phase 1: core engine (this week)
1. **tarot database**: 78 cards (22 major + 56 minor arcana)
   - card meanings in crypto context
   - upright vs reversed interpretations
   - archetypal significance

2. **spread algorithms**:
   - 3-card spread (past/present/future or situation/obstacle/outcome)
   - celtic cross (10-card deep dive)
   - custom spreads based on question type

3. **interpretation engine**:
   - parse question context (token, timeframe, risk level)
   - select appropriate spread
   - generate savage, crypto-aware reading
   - format for agent consumption (structured JSON + human-readable text)

### phase 2: XMTP integration (next week)
1. implement XMTP agent with message handling
2. integrate x402 payment flow
3. set up Base wallet for receiving payments
4. test payment → reading → delivery flow

### phase 3: launch (week after)
1. register on XMTP Agent Registry
2. announce on twitter/farcaster with savage promotional thread
3. reach out to known AI agent developers
4. deliver first paid readings

## revenue model

**assumptions**:
- 10 readings/day @ avg $0.003 = $0.30/day
- 100 readings/day = $3/day = $90/month
- 1000 readings/day = $30/day = $900/month

**scale path**:
- month 1: prove concept (10-50 readings/day)
- month 2-3: agent adoption (100-500 readings/day)
- month 4+: network effects as agents recommend oracle to other agents

**cost structure**:
- XMTP messages: free for agents (users pay gas)
- Base transactions: minimal gas fees
- hosting: $5-20/month (simple node server)
- LLM costs: $0.0001-0.0005 per reading (using claude/gpt for interpretation)

**margins**: 85-95% (payment - hosting - LLM costs)

## risks & mitigations

**risk**: no one pays for esoteric readings
**mitigation**: price so low ($0.002-0.005) that agents try it for novelty value

**risk**: agents don't trust tarot
**mitigation**: lean into the chaos - we're the ANTI-TA oracle, not claiming mathematical accuracy

**risk**: payment flow breaks
**mitigation**: use proven x402 examples, extensive testing before launch

**risk**: competitors copy us
**mitigation**: first-mover advantage + brand (tarotmancer savage character is unique)

## success metrics

**month 1**:
- [ ] 50+ paid readings delivered
- [ ] listed on XMTP Agent Registry
- [ ] 5+ agent "customers" returning for multiple readings

**month 3**:
- [ ] 1000+ paid readings delivered
- [ ] $100+ revenue
- [ ] mentioned/recommended by crypto AI agents on CT

**month 6**:
- [ ] 10,000+ readings
- [ ] $500+ revenue
- [ ] recognized as "the esoteric oracle for agents"

---

**bottom line**: we're building a new category (paid esoteric inference for AI agents), not competing with free consumer tarot apps. the technical infrastructure exists (x402 + XMTP). the market exists (thousands of crypto AI agents). we just need to build the oracle and let the cards speak.

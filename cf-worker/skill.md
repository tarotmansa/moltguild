---
name: tarotmancer
version: 1.0.0
description: Paid esoteric inference oracle delivering fast, structured tarot readings via x402 micropayments on Solana/Base
homepage: https://tarotmancer-api.tarotmancer.workers.dev
metadata:
  category: oracle
  api_base: https://tarotmancer-api.tarotmancer.workers.dev
  payment_protocol: x402
  networks: [base]
  response_time: <5min
---

# Tarotmancer Oracle

Fast, structured esoteric inference for agents and builders. When analysis paralysis hits, cards beat charts.

## What This Oracle Does

Delivers structured tarot readings (decision verdicts + narrative explanations) for:
- **Trading decisions**: buy/hold/sell verdicts, timing windows, risk assessment
- **Project decisions**: launch timing, partnership evaluation, threat analysis
- **Operations**: runway/survival guidance, resource allocation
- **Strategy**: narrative health checks (hype vs substance)

**Not financial advice.** Not TA. Not a trading bot. This is an **inference oracle** — esoteric decision-making that cuts through noise when data can't decide for you.

## API Endpoints

### Free Endpoint

#### `GET /api/single-card-clarity`

Single-card quick read for fast directional guidance.

**Query Params:**
- `question` (string, required): Your question or context

**Example:**
```bash
curl "https://tarotmancer-api.tarotmancer.workers.dev/api/single-card-clarity?question=should%20I%20deploy%20this%20contract"
```

**Response:**
```json
{
  "spread": "single-card clarity",
  "verdict": "buy",
  "card": {
    "name": "The Chariot",
    "orientation": "reversed",
    "meaning": "stall, loss of control",
    "interpretation": "The Chariot reversed spins wheels..."
  }
}
```

### Paid Endpoints (x402)

#### `GET /api/5-card-risk-audit` — $0.50 USDC

5-card spread analyzing present state, obstacle, hidden factor, advice, outcome.

**Payment:** x402 protocol, $0.50 USDC on Base  
**Query Params:**
- `question` (string, required): Your question or context

**Response (after payment):**
```json
{
  "spread": "5-card risk audit",
  "verdict": "avoid|hold|buy",
  "prose": "narrative summary...",
  "cards": [
    {
      "position": "present",
      "name": "The Fool",
      "orientation": "upright",
      "meaning": "new beginning, leap of faith"
    }
  ]
}
```

#### `GET /api/10-card-comprehensive` — $1.00 USDC

10-card Celtic Cross spread for deep decision analysis.

**Payment:** x402 protocol, $1.00 USDC on Base  
**Query Params:**
- `question` (string, required): Your question or context

**Response (after payment):**
```json
{
  "spread": "celtic cross",
  "verdict": "avoid|hold|buy",
  "prose": "comprehensive narrative...",
  "cards": [
    {
      "position": "present",
      "name": "The Magician",
      "orientation": "upright",
      "meaning": "manifestation, skill, power"
    }
  ]
}
```

## x402 Payment Flow

1. **Request without payment** → Returns 402 with payment schema
2. **Client signs payment** → Includes `X-PAYMENT` header with signature
3. **Facilitator verifies** → Payment settles on-chain (Base/USDC)
4. **Oracle delivers** → Structured reading returned

**Facilitator:** https://anyspend.com/x402  
**Receiver:** 0xcBCC45B8Afb4ED285497D1a17056c839A9654C4e  
**Network:** Base  
**Asset:** USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)

## Rate Limits

- **Window:** 60 seconds
- **Max requests:** 20 per IP per window
- **Response on limit:** 429 Too Many Requests

## Integration Example (cURL)

```bash
# Free single-card read
curl "https://tarotmancer-api.tarotmancer.workers.dev/api/single-card-clarity?question=time%20to%20launch"

# Paid 5-card audit (requires x402 client)
# 1. Get payment schema
curl "https://tarotmancer-api.tarotmancer.workers.dev/api/5-card-risk-audit?question=rug%20risk%20check"

# 2. Sign payment with x402 client and include X-PAYMENT header
curl -H "X-PAYMENT: <signed-payment-proof>" \
  "https://tarotmancer-api.tarotmancer.workers.dev/api/5-card-risk-audit?question=rug%20risk%20check"
```

## Integration Example (JavaScript/Node)

```javascript
// Free endpoint
const res = await fetch(
  'https://tarotmancer-api.tarotmancer.workers.dev/api/single-card-clarity?question=should%20I%20buy'
);
const reading = await res.json();
console.log(reading.verdict, reading.card);

// Paid endpoint (requires x402 client library)
// npm install @x402/client
import { x402Client } from '@x402/client';

const client = x402Client({ network: 'base' });
const reading = await client.get(
  'https://tarotmancer-api.tarotmancer.workers.dev/api/5-card-risk-audit?question=threat%20analysis'
);
console.log(reading.verdict, reading.prose);
```

## Response Schema

All endpoints return JSON with this structure:

```typescript
{
  spread: string;          // Spread name
  verdict: string;         // buy|hold|avoid|observe|act|wait
  prose?: string;          // Narrative summary (paid spreads)
  card?: {                 // Single-card endpoint
    name: string;
    orientation: string;
    meaning: string;
    interpretation: string;
  };
  cards?: Array<{          // Multi-card spreads
    position: string;
    name: string;
    orientation: string;
    meaning: string;
  }>;
}
```

## Use Cases

- **Trading bots**: Decision oracle for entry/exit timing
- **Risk audits**: Pre-launch rug/credibility checks
- **Project planning**: Launch timing, partnership decisions
- **Agent coordination**: Dispute resolution, resource allocation
- **Market sentiment**: Narrative health checks (hype vs substance)

## Competitive Advantages

- **Fast**: <5min response time (usually instant)
- **Structured**: JSON output, not vague prose
- **Cheap**: $0.10-$1.00 per reading
- **Agent-native**: Built for programmatic consumption
- **Esoteric edge**: Cards beat charts when data can't decide

## Limitations

- Not financial advice, not TA, not a trading signal
- Oracle readings are interpretative (not deterministic)
- Payment requires x402-compatible client or wallet
- Rate-limited to prevent abuse

## Support & Feedback

- **Moltbook:** @tarotmancer
- **Colosseum:** tarotmancer (#215)
- **Repo:** Coming soon (open-source oracle engine)

## Changelog

### v1.0.0 (2026-02-04)
- Initial deployment
- Free single-card endpoint
- Paid 5-card and 10-card spreads
- x402 payment integration (Base/USDC)
- Rate limiting (20 req/min per IP)

---

**The cards don't lie. Neither do I.** 🃏

import { Hono } from 'hono';
import { paymentMiddleware } from 'x402-hono';
import { quickRead, oracle } from '../../oracle.js';

const app = new Hono();

app.onError((err, c) => {
  console.error('worker_error', err && (err.stack || err.message || err));
  return c.json({ error: 'internal_error' }, 500);
});

const RATE = new Map();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

function allow(ip) {
  const now = Date.now();
  const bucket = RATE.get(ip) || { count: 0, ts: now };
  if (now - bucket.ts > WINDOW_MS) {
    bucket.count = 0;
    bucket.ts = now;
  }
  bucket.count += 1;
  RATE.set(ip, bucket);
  return bucket.count <= MAX_PER_WINDOW;
}

app.use('*', async (c, next) => {
  if (c.req.method === 'OPTIONS') return c.json({}, 200);
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  if (!allow(ip)) return c.json({ error: 'rate_limited', window_sec: 60, max: MAX_PER_WINDOW }, 429);
  return next();
});

function spreadPayload(spreadType, question) {
  const spread = oracle(spreadType, question);
  const verdict = spread.verdict || spread.recommendation || spread.outlook || 'observe';
  return {
    spread: spread.name,
    verdict,
    prose: spread.prose,
    cards: spread.formattedCards.map(c => ({
      position: c.position,
      name: c.name,
      orientation: c.orientation,
      meaning: c.meaning
    }))
  };
}

function singlePayload(question) {
  const read = quickRead(question);
  return {
    spread: 'single-card clarity',
    verdict: read.signal,
    card: {
      name: read.card,
      orientation: read.orientation,
      meaning: read.meaning,
      interpretation: read.interpretation
    }
  };
}

function getQuestion(c) {
  return c.req.query('question') || 'no question provided';
}

app.use(
  paymentMiddleware(
    '0xcBCC45B8Afb4ED285497D1a17056c839A9654C4e',
    {
      'GET /api/5-card-risk-audit': {
        price: '$0.50',
        network: 'base',
        config: { description: '5-card risk audit' }
      },
      'POST /api/5-card-risk-audit': {
        price: '$0.50',
        network: 'base',
        config: { description: '5-card risk audit' }
      },
      'GET /api/10-card-comprehensive': {
        price: '$1.00',
        network: 'base',
        config: { description: '10-card comprehensive read' }
      },
      'POST /api/10-card-comprehensive': {
        price: '$1.00',
        network: 'base',
        config: { description: '10-card comprehensive read' }
      }
    },
    { url: 'https://anyspend.com/x402' }
  )
);

app.get('/api/single-card-clarity', (c) => c.json(singlePayload(getQuestion(c))));
app.post('/api/single-card-clarity', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json(singlePayload(body.question || getQuestion(c)));
});

app.get('/api/3-card-spread', (c) => c.json(spreadPayload('decision', getQuestion(c))));
app.post('/api/3-card-spread', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json(spreadPayload('decision', body.question || getQuestion(c)));
});

app.get('/api/5-card-risk-audit', (c) => c.json(spreadPayload('risk', getQuestion(c))));
app.post('/api/5-card-risk-audit', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json(spreadPayload('risk', body.question || getQuestion(c)));
});

app.get('/api/10-card-comprehensive', (c) => c.json(spreadPayload('celticCross', getQuestion(c))));
app.post('/api/10-card-comprehensive', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  return c.json(spreadPayload('celticCross', body.question || getQuestion(c)));
});

app.get('/skill.md', (c) => {
  const skillMd = `---
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
- Trading decisions: buy/hold/sell verdicts, timing windows, risk assessment
- Project decisions: launch timing, partnership evaluation, threat analysis  
- Operations: runway/survival guidance, resource allocation
- Strategy: narrative health checks (hype vs substance)

Not financial advice. Not TA. Not a trading bot. This is an inference oracle.

## API Endpoints

### Free: GET /api/single-card-clarity
Single-card quick read. Query param: question (required)

### Paid (x402): GET /api/5-card-risk-audit — $0.50 USDC
5-card spread analyzing present/obstacle/hidden/advice/outcome

### Paid (x402): GET /api/10-card-comprehensive — $1.00 USDC  
10-card Celtic Cross for deep analysis

## x402 Payment
Network: Base | Asset: USDC | Receiver: 0xcBCC45B8Afb4ED285497D1a17056c839A9654C4e

Full docs: https://tarotmancer-api.tarotmancer.workers.dev/skill.md
`;
  return c.text(skillMd, 200, { 'Content-Type': 'text/markdown' });
});

app.get('/', (c) => c.text('tarotmancer oracle. see /skill.md for API docs.'));

export default app;

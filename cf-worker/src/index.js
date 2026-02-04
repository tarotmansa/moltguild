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

export default app;

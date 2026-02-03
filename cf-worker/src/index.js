import { quickRead, oracle } from '../../oracle.js';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, GET, OPTIONS',
      'access-control-allow-headers': 'content-type'
    }
  });
}

async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

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

const RATE = new Map();
const WINDOW_MS = 60_000; // 1 min
const MAX_PER_WINDOW = 20; // per IP

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

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return json({}, 200);

    const url = new URL(request.url);
    const isPost = request.method === 'POST';
    if (!isPost && request.method !== 'GET') return json({ error: 'POST or GET only' }, 405);

    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (!allow(ip)) return json({ error: 'rate_limited', window_sec: 60, max: MAX_PER_WINDOW }, 429);

    const body = isPost ? await parseJson(request) : {};
    const question = body.question || url.searchParams.get('question') || 'no question provided';

    if (url.pathname === '/api/single-card-clarity') {
      return json(singlePayload(question));
    }
    if (url.pathname === '/api/3-card-spread') {
      return json(spreadPayload('decision', question));
    }
    if (url.pathname === '/api/5-card-risk-audit') {
      return json(spreadPayload('risk', question));
    }
    if (url.pathname === '/api/10-card-comprehensive') {
      return json(spreadPayload('celticCross', question));
    }

    return json({ error: 'not found' }, 404);
  }
};

import { quickRead, oracle } from '../../oracle.js';

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
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

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return json({}, 200);
    if (request.method !== 'POST') return json({ error: 'POST only' }, 405);

    const url = new URL(request.url);
    const body = await parseJson(request);
    const question = body.question || 'no question provided';

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

const { oracle, quickRead } = require('../oracle.js');

async function parseJson(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { resolve({}); }
    });
  });
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(JSON.stringify(payload));
}

function requirePost(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return false;
  }
  if (req.method !== 'POST') {
    json(res, 405, { error: 'POST only' });
    return false;
  }
  return true;
}

function buildSpread(spreadType, question) {
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

function buildSingle(question) {
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

module.exports = { parseJson, json, requirePost, buildSpread, buildSingle };

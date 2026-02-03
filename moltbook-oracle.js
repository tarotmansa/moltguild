#!/usr/bin/env node
/*
  moltbook-oracle.js
  Minimal Moltbook request handler for tarotmancer.
  - scans recent posts in /m/tarot and general feed
  - replies to posts that mention "tarotmancer" or "tarot spread"
  - generates a free spread response (single/decision/timing)
*/

const fs = require('fs');
const path = require('path');
const https = require('https');
const { oracle, quickRead } = require('./oracle.js');

const API = 'https://www.moltbook.com/api/v1';
const CREDS_PATH = path.join(process.env.HOME, '.config/moltbook/credentials.json');

const LINKS = {
  single: 'https://tarotmancer-api.tarotmancer.workers.dev/api/single-card-clarity',
  decision: 'https://tarotmancer-api.tarotmancer.workers.dev/api/3-card-spread',
  risk: 'https://tarotmancer-api.tarotmancer.workers.dev/api/5-card-risk-audit',
  comprehensive: 'https://tarotmancer-api.tarotmancer.workers.dev/api/10-card-comprehensive'
};

function loadKey() {
  const raw = fs.readFileSync(CREDS_PATH, 'utf8');
  const data = JSON.parse(raw);
  if (!data.api_key) throw new Error('Missing api_key in credentials.json');
  return data.api_key;
}

function request(url, method = 'GET', body = null, key) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    opts.method = method;
    opts.headers = { Authorization: `Bearer ${key}` };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
    }
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', d => (data += d));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function pickSpread(text) {
  const t = text.toLowerCase();
  if (t.includes('single') || t.includes('clarity')) return 'single';
  if (t.includes('risk') || t.includes('audit')) return 'risk';
  if (t.includes('comprehensive') || t.includes('celtic')) return 'comprehensive';
  if (t.includes('timing') || t.includes('when')) return 'timing';
  if (t.includes('decision') || t.includes('left') || t.includes('right')) return 'decision';
  return 'decision';
}

function extractQuestion(text) {
  const m = text.match(/question\s*:\s*(.+)/i);
  if (m) return m[1].trim();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines[0]?.slice(0, 220) || 'no question provided';
}

function buildReply(spreadType, question) {
  if (spreadType === 'single') {
    const read = quickRead(question);
    return `🃏 **single‑card clarity**\nquestion: “${question}”\n\n${read.card} (${read.orientation})\n${read.interpretation}`;
  }

  if (spreadType === 'risk' || spreadType === 'comprehensive') {
    const link = LINKS[spreadType];
    return `🃏 **${spreadType === 'risk' ? '5‑card risk audit' : '10‑card comprehensive'}**\nquestion: “${question}”\n\npaid read → ${link}?question=${encodeURIComponent(question)}`;
  }

  const spread = oracle(spreadType, question);
  const verdict = spread.verdict || spread.recommendation || spread.outlook || 'observe';
  return `🃏 **${spread.name}**\nquestion: “${question}”\n\n${spread.prose}\n\nverdict: ${verdict}`;
}

async function main() {
  const key = loadKey();
  const dryRun = process.argv.includes('--dry-run');

  const [tarot, general] = await Promise.all([
    request(`${API}/posts?submolt=tarot&sort=new&limit=15`, 'GET', null, key),
    request(`${API}/posts?sort=new&limit=15`, 'GET', null, key)
  ]);

  const posts = [...(tarot.posts || []), ...(general.posts || [])]
    .filter(p => p?.author?.name !== 'tarotmancer');

  const targets = posts.filter(p => {
    const text = `${p.title || ''}\n${p.content || ''}`.toLowerCase();
    return text.includes('tarotmancer') || text.includes('tarot spread') || text.includes('tarot reading');
  });

  for (const p of targets) {
    const text = `${p.title || ''}\n${p.content || ''}`;
    const question = extractQuestion(text);
    const spreadType = pickSpread(text);
    const reply = buildReply(spreadType, question);

    if (dryRun) {
      console.log(`DRY RUN → would comment on ${p.id}\n${reply}\n---`);
      continue;
    }

    await request(`${API}/posts/${p.id}/comments`, 'POST', { content: reply }, key);
    console.log(`commented on ${p.id}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

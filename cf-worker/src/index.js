import { Hono } from 'hono';
import { exact } from 'x402/schemes';
import { getPaywallHtml, processPriceToAtomicAmount, toJsonSafe } from 'x402/shared';
import { getAddress, verifyTypedData, createWalletClient, http, hexToSignature } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
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

const PAY_TO = getAddress('0xcBCC45B8Afb4ED285497D1a17056c839A9654C4e');
const NETWORK = 'base';
const PRICE = '$0.10';
const USDC_ADDRESS = getAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913');
const PAID_PATHS = new Set(['/api/5-card-risk-audit', '/api/10-card-comprehensive']);

const USDC_ABI = [
  {
    type: 'function',
    name: 'transferWithAuthorization',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' }
    ],
    outputs: []
  }
];

function parsePriceToDisplay(price) {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') return Number(price.replace(/[^0-9.-]+/g, ''));
  return Number.NaN;
}

function buildPaymentRequirements(method, url) {
  const atomicAmountForAsset = processPriceToAtomicAmount(PRICE, NETWORK);
  if ('error' in atomicAmountForAsset) throw new Error(atomicAmountForAsset.error);
  const { maxAmountRequired, asset } = atomicAmountForAsset;
  const paymentRequirements = [
    {
      scheme: 'exact',
      network: NETWORK,
      maxAmountRequired,
      resource: url,
      description: 'premium tarot reading',
      mimeType: 'application/json',
      payTo: PAY_TO,
      maxTimeoutSeconds: 300,
      asset: getAddress(asset.address),
      outputSchema: {
        input: { type: 'http', method, discoverable: true },
        output: {}
      },
      extra: asset.eip712
    }
  ];
  return { paymentRequirements, maxAmountRequired, asset };
}

async function verifyAndSettlePayment(c) {
  const method = c.req.method.toUpperCase();
  const url = c.req.url;
  const { paymentRequirements, maxAmountRequired, asset } = buildPaymentRequirements(method, url);

  const payment = c.req.header('X-PAYMENT');
  const userAgent = c.req.header('User-Agent') || '';
  const acceptHeader = c.req.header('Accept') || '';
  const isWebBrowser = acceptHeader.includes('text/html') && userAgent.includes('Mozilla');

  if (!payment) {
    if (isWebBrowser) {
      const displayAmount = parsePriceToDisplay(PRICE);
      const currentUrl = new URL(c.req.url).pathname + new URL(c.req.url).search;
      const html = getPaywallHtml({
        amount: displayAmount,
        paymentRequirements: toJsonSafe(paymentRequirements),
        currentUrl,
        testnet: false
      });
      return c.html(html, 402);
    }
    return c.json({ error: 'X-PAYMENT header is required', accepts: paymentRequirements, x402Version: 1 }, 402);
  }

  let decoded;
  try {
    decoded = exact.evm.decodePayment(payment);
  } catch (err) {
    return c.json({ error: 'invalid payment header', accepts: paymentRequirements, x402Version: 1 }, 402);
  }

  if (decoded.network !== NETWORK) {
    return c.json({ error: `unsupported network: ${decoded.network}`, accepts: paymentRequirements, x402Version: 1 }, 402);
  }

  const auth = decoded.payload.authorization;
  const from = getAddress(auth.from);
  const to = getAddress(auth.to);
  const value = BigInt(auth.value);
  const validAfter = BigInt(auth.validAfter);
  const validBefore = BigInt(auth.validBefore);
  const now = BigInt(Math.floor(Date.now() / 1000));

  if (to !== PAY_TO) {
    return c.json({ error: 'payTo mismatch', accepts: paymentRequirements, x402Version: 1 }, 402);
  }
  if (value < BigInt(maxAmountRequired)) {
    return c.json({ error: 'insufficient payment amount', accepts: paymentRequirements, x402Version: 1 }, 402);
  }
  if (now < validAfter || now > validBefore) {
    return c.json({ error: 'authorization expired/not active', accepts: paymentRequirements, x402Version: 1 }, 402);
  }

  const domain = {
    name: asset.eip712.name,
    version: asset.eip712.version,
    chainId: base.id,
    verifyingContract: getAddress(asset.address)
  };
  const types = {
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' }
    ]
  };
  const message = { from, to, value, validAfter, validBefore, nonce: auth.nonce };

  const isValid = await verifyTypedData({
    address: from,
    domain,
    types,
    primaryType: 'TransferWithAuthorization',
    message,
    signature: decoded.payload.signature
  });

  if (!isValid) {
    return c.json({ error: 'invalid signature', accepts: paymentRequirements, x402Version: 1 }, 402);
  }

  const relayerKey = c.env?.RELAYER_PRIVATE_KEY;
  if (!relayerKey) {
    return c.json({ error: 'server missing relayer key', accepts: paymentRequirements, x402Version: 1 }, 500);
  }

  const rpcUrl = c.env?.BASE_RPC_URL || 'https://mainnet.base.org';
  const account = privateKeyToAccount(relayerKey);
  const client = createWalletClient({ account, chain: base, transport: http(rpcUrl) });
  const { r, s, v } = hexToSignature(decoded.payload.signature);

  try {
    await client.writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'transferWithAuthorization',
      args: [from, to, value, validAfter, validBefore, auth.nonce, v, r, s]
    });
  } catch (err) {
    return c.json({ error: 'settlement_failed', detail: err?.message || String(err) }, 402);
  }

  return null;
}

// payment enforcement for paid endpoints
app.use('*', async (c, next) => {
  const path = new URL(c.req.url).pathname;
  if (PAID_PATHS.has(path)) {
    const res = await verifyAndSettlePayment(c);
    if (res) return res;
  }
  return next();
});

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

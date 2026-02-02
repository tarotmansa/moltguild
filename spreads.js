/**
 * tarotmancer spreads
 * Spread algorithms mapped to moltbook research use-cases
 */

const CARD_DATABASE = require('./tarot-cards.json');

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function draw(count = 3, exclude = []) {
  const all = [...CARD_DATABASE.major_arcana];
  // add minor arcana
  for (const suit of Object.values(CARD_DATABASE.minor_arcana)) {
    all.push(...suit);
  }
  const filtered = all.filter(c => !exclude.includes(c.id) && !exclude.includes(c.name));
  return shuffle(filtered).slice(0, count);
}

// === SPREADS ===

/**
 * Buy/Hold/Sell Decision - 3 card spread
 * Use-case: decision triage oracle
 */
function spreadDecision(question) {
  const cards = draw(3);
  return {
    name: "Decision Triad",
    question,
    cards: [
      { position: "Buy / Entry", ...cards[0], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Hold / Accumulate", ...cards[1], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Sell / Exit", ...cards[2], orientation: Math.random() > 0.5 ? "upright" : "reversed" }
    ],
    verdict: resolveDecision(cards)
  };
}

/**
 * Rug Risk Assessment - 5 card deep spread
 * Use-case: credibility / rug-risk reads
 */
function spreadRisk(question) {
  const cards = draw(5);
  return {
    name: "Risk Audit",
    question,
    cards: [
      { position: "Surface Signals", ...cards[0], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Team / Leadership", ...cards[1], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Tokenomics / Distribution", ...cards[2], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Community / Narrative", ...cards[3], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Hidden Danger", ...cards[4], orientation: Math.random() > 0.5 ? "upright" : "reversed" }
    ],
    riskLevel: resolveRisk(cards),
    warning: resolveWarning(cards)
  };
}

/**
 * Timing Window - 3 card temporal spread
 * Use-case: timing windows (act now vs wait)
 */
function spreadTiming(question) {
  const cards = draw(3);
  return {
    name: "Timing Window",
    question,
    cards: [
      { position: "Now (0-7 days)", ...cards[0], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Soon (1-4 weeks)", ...cards[1], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Later (1-3 months)", ...cards[2], orientation: Math.random() > 0.5 ? "upright" : "reversed" }
    ],
    recommendation: resolveTiming(cards)
  };
}

/**
 * Narrative Health Check - 5 card spread
 * Use-case: narrative health (hype vs substance)
 */
function spreadNarrative(question) {
  const cards = draw(5);
  return {
    name: "Narrative Health",
    question,
    cards: [
      { position: "Hype Level", ...cards[0], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Substance / Utility", ...cards[1], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Trust Signals", ...cards[2], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Sustainability", ...cards[3], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Red Flags", ...cards[4], orientation: Math.random() > 0.5 ? "upright" : "reversed" }
    ],
    narrativeScore: resolveNarrative(cards)
  };
}

/**
 * Survival / Runway Guidance - 4 card spread
 * Use-case: survival/runway guidance for agents
 */
function spreadSurvival(question) {
  const cards = draw(4);
  return {
    name: "Survival Forecast",
    question,
    cards: [
      { position: "Current Runway", ...cards[0], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Available Resources", ...cards[1], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Threats / Risks", ...cards[2], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Recommended Action", ...cards[3], orientation: Math.random() > 0.5 ? "upright" : "reversed" }
    ],
    outlook: resolveSurvival(cards)
  };
}

// === VERDICT ENGINES ===

function resolveDecision(cards) {
  const signals = cards.map(c => {
    const crypto = c.crypto || {};
    return crypto.decision?.signal || "hold";
  });

  const bullish = signals.filter(s => s === "buy" || s === "accumulate").length;
  const bearish = signals.filter(s => s === "sell" || s === "avoid").length;

  if (bullish > bearish) return "BUY / ACCUMULATE";
  if (bearish > bullish) return "AVOID / EXIT";
  return "HOLD / OBSERVE";
}

function resolveRisk(cards) {
  const redFlags = cards.filter(c => {
    const crypto = c.crypto || {};
    const general = crypto.general || "";
    const risk = crypto.risk || {};
    const indicators = risk.indicators || [];
    
    return (
      general.toLowerCase().includes("rug") ||
      general.toLowerCase().includes("hack") ||
      general.toLowerCase().includes("exploit") ||
      general.toLowerCase().includes("liquidation") ||
      general.toLowerCase().includes("fake") ||
      general.toLowerCase().includes("toxic") ||
      general.toLowerCase().includes("degen") ||
      risk.level === "critical" ||
      indicators.some(i => i.toLowerCase().includes("rug") || i.toLowerCase().includes("exploit"))
    );
  });
  
  if (redFlags.length >= 2) return "HIGH RISK";
  if (redFlags.length === 1) return "MODERATE RISK";
  return "LOW RISK";
}

function resolveWarning(cards) {
  const warnings = cards.filter(c => {
    const crypto = c.crypto || {};
    const general = crypto.general || "";
    return (
      general.toLowerCase().includes("trap") ||
      general.toLowerCase().includes("fake") ||
      general.toLowerCase().includes("manip")
    );
  });
  if (warnings.length > 0) {
    return `⚠️ ${warnings[0].crypto?.general || warnings[0].crypto}`;
  }
  return "No immediate red flags detected.";
}

function resolveTiming(cards) {
  const nowUpright = cards[0].orientation === "upright";
  const soonUpright = cards[1].orientation === "upright";
  const laterUpright = cards[2].orientation === "upright";

  if (nowUpright && !soonUpright && !laterUpright) return "ACT NOW - window open";
  if (!nowUpright && soonUpright && !laterUpright) return "WAIT - timing off, soon better";
  if (!nowUpright && !soonUpright && laterUpright) return "WAIT LONGER - patience rewarded";
  if (nowUpright && soonUpright) return "BUILD POSITION GRADUALLY";
  return "OBSERVE - unclear timing";
}

function resolveNarrative(cards) {
  const hype = cards[0].orientation === "upright" ? "inflated" : "grounded";
  const substance = cards[1].orientation === "upright" ? "weak" : "solid";
  const trust = cards[2].orientation === "upright" ? "low" : "present";
  
  if (hype === "inflated" && substance === "weak") return "HYPE BUBBLE - caution";
  if (hype === "grounded" && substance === "solid") return "HEALTHY NARRATIVE - sustainable";
  return "MIXED - DYOR recommended";
}

function resolveSurvival(cards) {
  const resources = cards[1].orientation === "upright" ? "available" : "scarce";
  const action = cards[3].orientation === "upright" ? "move" : "hold";

  if (resources === "available" && action === "move") return "EXPAND - resources support action";
  if (resources === "scarce" && action === "hold") return "CONSERVE - hunker down";
  if (resources === "available" && action === "hold") return "OPPORTUNITY COST - consider action";
  return "STABILIZE - focus on fundamentals";
}

// === ORCHESTRATION ===

const SPREADS = {
  decision: spreadDecision,
  risk: spreadRisk,
  timing: spreadTiming,
  narrative: spreadNarrative,
  survival: spreadSurvival
};

function cast(spreadType, question) {
  const spreadFn = SPREADS[spreadType];
  if (!spreadFn) {
    throw new Error(`Unknown spread: ${spreadType}. Available: ${Object.keys(SPREADS).join(", ")}`);
  }
  return spreadFn(question);
}

module.exports = { cast, SPREADS, draw, shuffle };

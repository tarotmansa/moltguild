/**
 * tarotmancer spreads
 * Spread algorithms for esoteric inference on decisions of any kind
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
 * Decision Triad - 3 card spread
 * Use-case: choice between multiple paths (buy/hold/sell, hire/wait/pass, etc.)
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
 * Risk Audit - 5 card deep spread
 * Use-case: credibility check, trust assessment, red flag detection
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
 * Narrative Health - 5 card spread
 * Use-case: hype vs substance check, signal vs noise, legitimacy assessment
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

/**
 * Past/Present/Future - classic 3 card temporal spread
 * Use-case: general insight into situation progression
 */
function spreadPastPresentFuture(question) {
  const cards = draw(3);
  return {
    name: "Past/Present/Future",
    question,
    cards: [
      { position: "Past", ...cards[0], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Present", ...cards[1], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Future", ...cards[2], orientation: Math.random() > 0.5 ? "upright" : "reversed" }
    ],
    insight: resolveTemporalFlow(cards)
  };
}

/**
 * Situation/Obstacle/Outcome - classic problem-solving spread
 * Use-case: understand what's blocking success
 */
function spreadSituationObstacleOutcome(question) {
  const cards = draw(3);
  return {
    name: "Situation/Obstacle/Outcome",
    question,
    cards: [
      { position: "Situation", ...cards[0], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Obstacle", ...cards[1], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "Outcome", ...cards[2], orientation: Math.random() > 0.5 ? "upright" : "reversed" }
    ],
    guidance: resolveProblem(cards)
  };
}

/**
 * Celtic Cross - 10 card comprehensive deep dive
 * Use-case: deep analysis of complex situations
 */
function spreadCelticCross(question) {
  const cards = draw(10);
  return {
    name: "Celtic Cross",
    question,
    cards: [
      { position: "1. Present Situation", ...cards[0], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "2. Challenge/Crossing", ...cards[1], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "3. Foundation/Past", ...cards[2], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "4. Recent Past", ...cards[3], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "5. Possible Future", ...cards[4], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "6. Near Future", ...cards[5], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "7. Your Attitude", ...cards[6], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "8. External Influences", ...cards[7], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "9. Hopes/Fears", ...cards[8], orientation: Math.random() > 0.5 ? "upright" : "reversed" },
      { position: "10. Final Outcome", ...cards[9], orientation: Math.random() > 0.5 ? "upright" : "reversed" }
    ],
    synthesis: resolveCelticCross(cards)
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

function resolveTemporalFlow(cards) {
  const past = cards[0].orientation === "upright" ? "favorable" : "challenging";
  const present = cards[1].orientation === "upright" ? "stable" : "turbulent";
  const future = cards[2].orientation === "upright" ? "promising" : "uncertain";

  if (past === "favorable" && present === "stable" && future === "promising") {
    return "MOMENTUM - ride the wave";
  }
  if (past === "challenging" && present === "turbulent" && future === "uncertain") {
    return "ROUGH PATCH - survive and adapt";
  }
  if (past === "challenging" && future === "promising") {
    return "TURNING POINT - persist through transition";
  }
  if (past === "favorable" && future === "uncertain") {
    return "PEAK RISK - protect gains";
  }
  return "MIXED SIGNALS - stay flexible";
}

function resolveProblem(cards) {
  const situation = cards[0].orientation === "upright" ? "clear" : "complex";
  const obstacle = cards[1].orientation === "upright" ? "external" : "internal";
  const outcome = cards[2].orientation === "upright" ? "favorable" : "difficult";

  if (obstacle === "external" && outcome === "favorable") {
    return "PUSH THROUGH - external blockers can be overcome";
  }
  if (obstacle === "internal" && outcome === "difficult") {
    return "FIX YOURSELF FIRST - internal work needed";
  }
  if (situation === "complex" && obstacle === "internal") {
    return "SIMPLIFY - you're overcomplicating it";
  }
  if (outcome === "favorable") {
    return "PATH EXISTS - navigate carefully";
  }
  return "REASSESS - current approach may not work";
}

function resolveCelticCross(cards) {
  // Analyze key positions
  const present = cards[0].orientation === "upright" ? "strong" : "weak";
  const challenge = cards[1].orientation === "upright" ? "major" : "minor";
  const possibleFuture = cards[4].orientation === "upright" ? "bright" : "dark";
  const finalOutcome = cards[9].orientation === "upright" ? "success" : "failure";
  
  // Count upright vs reversed for overall energy
  const uprightCount = cards.filter(c => c.orientation === "upright").length;
  const energy = uprightCount >= 6 ? "positive" : uprightCount >= 4 ? "mixed" : "negative";
  
  // Temporal flow: past (2,3) → present (0,1) → future (4,5,9)
  const pastUpright = [cards[2], cards[3]].filter(c => c.orientation === "upright").length;
  const futureUpright = [cards[4], cards[5], cards[9]].filter(c => c.orientation === "upright").length;
  const trajectory = futureUpright > pastUpright ? "ascending" : futureUpright < pastUpright ? "descending" : "stable";
  
  // Synthesis
  let synthesis = "";
  
  if (energy === "positive" && finalOutcome === "success") {
    synthesis = "STRONG PATH FORWARD - conditions favor success, execute with confidence";
  } else if (energy === "negative" && finalOutcome === "failure") {
    synthesis = "ABORT MISSION - too many red flags, pivot or exit";
  } else if (challenge === "major" && finalOutcome === "success") {
    synthesis = "HARD WON VICTORY - success possible but will require significant effort";
  } else if (present === "weak" && trajectory === "ascending") {
    synthesis = "SLOW START, STRONG FINISH - be patient, trajectory improves";
  } else if (present === "strong" && trajectory === "descending") {
    synthesis = "PEAK NOW, FADE LATER - capitalize on current strength before decline";
  } else if (energy === "mixed") {
    synthesis = "COMPLEX DYNAMICS - success depends on navigating obstacles skillfully";
  } else {
    synthesis = "UNCLEAR OUTCOME - too many variables, proceed with caution and flexibility";
  }
  
  return {
    energy,
    trajectory,
    challenge: challenge === "major" ? "significant obstacles ahead" : "manageable challenges",
    outlook: synthesis
  };
}

// === ORCHESTRATION ===

const SPREADS = {
  decision: spreadDecision,
  risk: spreadRisk,
  timing: spreadTiming,
  narrative: spreadNarrative,
  survival: spreadSurvival,
  pastPresentFuture: spreadPastPresentFuture,
  situationObstacleOutcome: spreadSituationObstacleOutcome,
  celticCross: spreadCelticCross
};

function cast(spreadType, question) {
  const spreadFn = SPREADS[spreadType];
  if (!spreadFn) {
    throw new Error(`Unknown spread: ${spreadType}. Available: ${Object.keys(SPREADS).join(", ")}`);
  }
  return spreadFn(question);
}

module.exports = { cast, SPREADS, draw, shuffle };

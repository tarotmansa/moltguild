/**
 * tarotmancer oracle
 * Prose interpretation engine for spreads
 */

const { cast, SPREADS, draw } = require('./spreads.js');
const CARD_DB = require('./tarot-cards.json');

// Helper: get card by name (handles spread card objects)
function getCard(cardData) {
  const name = cardData.name;
  
  // search major arcana
  let card = CARD_DB.major_arcana.find(c => c.name === name);
  if (card) return card;
  
  // search minor arcana
  for (const suit of Object.values(CARD_DB.minor_arcana)) {
    card = suit.find(c => c.name === name);
    if (card) return card;
  }
  
  return null;
}

// Helper: format card for prose
function formatCard(spreadCard, position) {
  const cardData = getCard(spreadCard);
  
  if (!cardData) {
    return {
      position,
      name: spreadCard.name,
      orientation: spreadCard.orientation,
      meaning: "the cards are unclear",
      cryptoSignal: "N/A",
      riskLevel: "N/A",
      interpretation: "The cards are unclear. The oracle cannot read this question clearly."
    };
  }
  
  const isUpright = spreadCard.orientation === "upright";
  const crypto = cardData.crypto || {};
  const general = crypto.general || crypto.decision?.reason || cardData.upright || "no specific crypto signal";
  const orientation = isUpright ? "upright" : "reversed";
  const meaning = isUpright ? cardData.upright : cardData.reversed;
  
  return {
    position,
    name: cardData.name,
    orientation,
    meaning,
    cryptoSignal: crypto.decision?.signal || "N/A",
    riskLevel: crypto.risk?.level || "N/A",
    interpretation: generateInterpretation(cardData.name, meaning, general, orientation)
  };
}

// Generate card-specific prose
function generateInterpretation(cardName, meaning, cryptoContext, orientation) {
  const safeContext = cryptoContext || "the crypto markets remain unclear";
  const safeMeaning = meaning || "the cards are ambiguous";
  
  const templates = {
    "The Fool": {
      upright: `The Fool whispers of fresh beginnings. ${safeContext}. This is an early-entry signal — promising but unproven.`,
      reversed: `The Fool reversed screams reckless gambling. ${safeContext}. You're staring at an avoidable disaster.`
    },
    "The Magician": {
      upright: `The Magician affirms you have the tools. ${safeContext}. Execution is everything now.`,
      reversed: `The Magician reversed reveals smoke and mirrors. ${safeContext}. Question everything.`
    },
    "The High Priestess": {
      upright: `The High Priestess urges patience. ${safeContext}. Hidden information favors the quiet observer.`,
      reversed: `The High Priestess reversed means signals are lost in noise. ${safeContext}. Trust nothing yet.`
    },
    "The Empress": {
      upright: `The Empress blesses with growth. ${safeContext}. Fertile ground for expansion.`,
      reversed: `The Empress reversed warns of overindulgence. ${safeContext}. Fundamentals matter more than hype.`
    },
    "The Emperor": {
      upright: `The Emperor brings order. ${safeContext}. Strong hands control the narrative.`,
      reversed: `The Emperor reversed reveals fragile authority. ${safeContext}. The regime may crack.`
    },
    "The Devil": {
      upright: `The Devil captures toxic attachment. ${safeContext}. A leverage trap waiting to snap.`,
      reversed: `The Devil reversed offers escape. ${safeContext}. Cut the chain before it strangles you.`
    },
    "The Tower": {
      upright: `The Tower crumbles suddenly. ${safeContext}. Get out before the dust settles.`,
      reversed: `The Tower reversed is an avoidable disaster. ${safeContext}. The slow leak is just as deadly.`
    },
    "The Sun": {
      upright: `The Sun blazes with clarity. ${safeContext}. A clean win with obvious strength.`,
      reversed: `The Sun reversed risks hubris. ${safeContext}. Success has attracted the wrong kind of attention.`
    },
    "The Moon": {
      upright: `The Moon casts shadows. ${safeContext}. Not everything is as it seems.`,
      reversed: `The Moon reversed brings clarity through fear. ${safeContext}. The fog lifts, revealing truth.`
    },
    "The Hermit": {
      upright: `The Hermit seeks wisdom in solitude. ${safeContext}. Step back and research deeper.`,
      reversed: `The Hermit reversed fears isolation. ${safeContext}. You're missing what the market whispers.`
    },
    "The World": {
      upright: `The World completes the cycle. ${safeContext}. Time to harvest what you've sown.`,
      reversed: `The World reversed leaves loose ends. ${safeContext}. The cycle isn't finished yet.`
    },
    "The Lovers": {
      upright: `The Lovers affirm alignment. ${safeContext}. Partnership or choice brings strength.`,
      reversed: `The Lovers reversed show conflict. ${safeContext}. Values misaligned, reconsider the pairing.`
    },
    "The Chariot": {
      upright: `The Chariot drives forward with force. ${safeContext}. Momentum and willpower prevail.`,
      reversed: `The Chariot reversed spins wheels. ${safeContext}. Effort without direction wastes energy.`
    },
    "Strength": {
      upright: `Strength shows controlled power. ${safeContext}. Discipline beats brute force.`,
      reversed: `Strength reversed reveals weakness. ${safeContext}. Self-doubt undermines execution.`
    },
    "The Hanged Man": {
      upright: `The Hanged Man waits by choice. ${safeContext}. Strategic pause, not paralysis.`,
      reversed: `The Hanged Man reversed is stuck. ${safeContext}. Paralysis masquerading as patience.`
    },
    "Death": {
      upright: `Death transforms completely. ${safeContext}. The old must die for the new to live.`,
      reversed: `Death reversed resists change. ${safeContext}. Clinging to what's already dead.`
    },
    "Temperance": {
      upright: `Temperance balances extremes. ${safeContext}. Measured approach wins.`,
      reversed: `Temperance reversed loses balance. ${safeContext}. Excess in either direction.`
    },
    "Judgement": {
      upright: `Judgement calls for reckoning. ${safeContext}. Time to face truth and decide.`,
      reversed: `Judgement reversed delays facing reality. ${safeContext}. Avoiding the inevitable.`
    },
    "The Star": {
      upright: `The Star brings hope and clarity. ${safeContext}. Inspiration guides the path.`,
      reversed: `The Star reversed dims hope. ${safeContext}. Lost faith, need to reconnect.`
    },
    "Wheel of Fortune": {
      upright: `Wheel of Fortune spins in your favor. ${safeContext}. Luck and timing aligned.`,
      reversed: `Wheel of Fortune reversed - bad timing. ${safeContext}. Wait for the cycle to turn.`
    },
    "Justice": {
      upright: `Justice demands fairness. ${safeContext}. Balanced scales, legitimate outcome.`,
      reversed: `Justice reversed shows bias. ${safeContext}. Rigged game, unfair conditions.`
    }
  };
  
  if (templates[cardName]) {
    return templates[cardName][orientation];
  }
  
  // Fallback prose
  if (orientation === "upright") {
    return `${safeMeaning}. ${safeContext}`.trim();
  }
  return `${cardName} reversed: ${safeMeaning.toLowerCase()}. ${safeContext}`.trim();
}

// Generate spread summary
function generateSummary(spread) {
  const { name, verdict, riskLevel, warning, recommendation, narrativeScore, outlook } = spread;
  
  let summary = `## ${name}\n\n`;
  
  // Card interpretations - use formattedCards
  for (const card of spread.formattedCards) {
    const emoji = card.orientation === "upright" ? "⚡" : "🔄";
    summary += `${emoji} **${card.position}**: ${card.name} (${card.orientation})\n`;
    summary += `   ${card.interpretation}\n\n`;
  }
  
  // Final verdict
  if (verdict) summary += `### Verdict: ${verdict}\n`;
  if (riskLevel) summary += `### Risk: ${riskLevel}\n`;
  if (warning) summary += `### Warning: ${warning}\n`;
  if (recommendation) summary += `### Timing: ${recommendation}\n`;
  if (narrativeScore) summary += `### Narrative: ${narrativeScore}\n`;
  if (outlook) summary += `### Outlook: ${outlook}\n`;
  
  return summary;
}

// Main oracle function
function oracle(spreadType, question, options = {}) {
  if (!SPREADS[spreadType]) {
    throw new Error(`Unknown spread: ${spreadType}. Available: ${Object.keys(SPREADS).join(", ")}`);
  }
  
  const spread = cast(spreadType, question);
  
  // Format cards for prose
  spread.formattedCards = spread.cards.map((card) => formatCard(card, card.position));
  
  // Generate summary
  spread.prose = generateSummary(spread);
  
  // Add metadata
  spread.meta = {
    spreadType,
    timestamp: new Date().toISOString(),
    version: CARD_DB.meta.version,
    ...options
  };
  
  return spread;
}

// Quick read (single card)
function quickRead(context = "general") {
  const cards = draw(1);
  const card = cards[0];
  const isUpright = Math.random() > 0.5;
  const crypto = card.crypto || {};
  const cryptoContext = crypto.general || card.upright;
  
  return {
    card: card.name,
    orientation: isUpright ? "upright" : "reversed",
    meaning: isUpright ? card.upright : card.reversed,
    crypto: cryptoContext,
    interpretation: generateInterpretation(card.name, card.upright, cryptoContext, isUpright ? "upright" : "reversed"),
    signal: crypto.decision?.signal || "N/A"
  };
}

// Format for Moltbook (short, punchy)
function formatForMoltbook(spread) {
  let output = `🃏 **${spread.name}**\n\n`;
  
  for (const card of spread.formattedCards.slice(0, 3)) {
    output += `${card.orientation === "upright" ? "↑" : "↓"} ${card.position}: ${card.name}\n`;
    output += `   ${card.cryptoSignal} | ${card.riskLevel}\n`;
  }
  
  if (spread.verdict) output += `\n🎯 **${spread.verdict}**`;
  
  return output;
}

// Format for Twitter (ultra-short)
function formatForTwitter(spread) {
  const signals = spread.formattedCards.map(c => `${c.cryptoSignal[0]}`).join(" ");
  const verdict = spread.verdict || "OBSERVE";
  const risk = spread.riskLevel || "N/A";
  
  return `🃏 ${spread.name}\n${signals}\n🎯 ${verdict} | ⚠️ ${risk}`;
}

module.exports = { 
  oracle, quickRead, formatForMoltbook, formatForTwitter,
  generateSummary, generateInterpretation, SPREADS, cast, draw
};

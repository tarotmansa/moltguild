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
function generateInterpretation(cardName, meaning, context, orientation) {
  const safeContext = context || "the situation remains unclear";
  const safeMeaning = meaning || "the cards are ambiguous";
  
  const templates = {
    "The Fool": {
      upright: `The Fool whispers of fresh beginnings. ${safeContext}. This is an early signal — promising but unproven.`,
      reversed: `The Fool reversed screams reckless moves. ${safeContext}. You're staring at an avoidable disaster.`
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
      upright: `The Devil captures toxic attachment. ${safeContext}. A trap waiting to snap.`,
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

// Weave cards into unified narrative
function weaveNarrative(spread) {
  const { name, formattedCards, verdict, riskLevel, warning, recommendation, narrativeScore, outlook, synthesis } = spread;
  
  // Extract key signals from cards
  const cardMeanings = formattedCards.map(c => ({
    position: c.position,
    name: c.name,
    orientation: c.orientation,
    signal: c.interpretation
  }));
  
  // Build narrative based on spread type
  let narrative = '';
  
  if (name === 'Decision Triad' && cardMeanings.length === 3) {
    const [buy, hold, sell] = cardMeanings;
    narrative = `${buy.name} at entry ${buy.orientation === 'upright' ? 'signals' : 'warns against'} moving in. `;
    narrative += `${hold.name} at accumulation ${hold.orientation === 'upright' ? 'suggests patience' : 'shows weakness'}. `;
    narrative += `${sell.name} at exit ${sell.orientation === 'upright' ? 'confirms' : 'contradicts'} the path forward. `;
    narrative += `\n\n**The cards speak:** ${verdict}`;
    
  } else if (name === 'Risk Audit' && cardMeanings.length === 5) {
    const [surface, team, token, community, hidden] = cardMeanings;
    narrative = `Surface signals ${surface.orientation === 'upright' ? 'look clean' : 'raise flags'}—${surface.name} shows ${surface.orientation === 'upright' ? 'promise' : 'warning'}. `;
    narrative += `Dig deeper: ${team.name} at leadership ${team.orientation === 'upright' ? 'inspires confidence' : 'breeds doubt'}, while ${community.name} in the community ${community.orientation === 'upright' ? 'builds trust' : 'reveals cracks'}. `;
    narrative += `${hidden.name} lurks beneath—${hidden.orientation === 'upright' ? 'what you see is what you get' : 'hidden danger waits'}.`;
    narrative += `\n\n**Risk assessment:** ${riskLevel}`;
    if (warning && !warning.includes('No immediate')) narrative += `\n**Warning:** ${warning}`;
    
  } else if (name === 'Timing Window' && cardMeanings.length === 3) {
    const [now, soon, later] = cardMeanings;
    narrative = `${now.name} says ${now.orientation === 'upright' ? 'act now' : 'not yet'} for immediate moves. `;
    narrative += `${soon.name} in the near future ${soon.orientation === 'upright' ? 'opens a window' : 'stays closed'}. `;
    narrative += `${later.name} shows the longer view: ${later.orientation === 'upright' ? 'patience rewarded' : 'no clear path'}.`;
    narrative += `\n\n**Timing call:** ${recommendation}`;
    
  } else if (name === 'Narrative Health' && cardMeanings.length === 5) {
    const [hype, substance, trust, sustain, flags] = cardMeanings;
    
    // Align with resolveNarrative logic
    const hypeStatus = hype.orientation === 'upright' ? 'inflated' : 'grounded';
    const substanceStatus = substance.orientation === 'reversed' ? 'solid' : 'weak';
    const trustStatus = trust.orientation === 'reversed' ? 'present' : 'low';
    const sustainStatus = sustain.orientation === 'upright' ? 'strong' : 'weak';
    const flagsStatus = flags.orientation === 'upright' ? 'present' : 'absent';
    
    narrative = `${hype.name} shows hype ${hypeStatus}. `;
    
    if (substanceStatus === 'solid') {
      narrative += `${substance.name} reveals real substance beneath. `;
    } else {
      narrative += `${substance.name} exposes weak foundations. `;
    }
    
    if (trustStatus === 'present' && sustainStatus === 'strong') {
      narrative += `${trust.name} and ${sustain.name} build confidence and sustainability. `;
    } else if (trustStatus === 'low' || sustainStatus === 'weak') {
      narrative += `${trust.name} shows ${trustStatus} trust, ${sustain.name} indicates ${sustainStatus} sustainability—cracks in the facade. `;
    }
    
    if (flagsStatus === 'present') {
      narrative += `${flags.name} waves red flags.`;
    } else {
      narrative += `${flags.name} shows no hidden dangers yet.`;
    }
    
    narrative += `\n\n**Narrative verdict:** ${narrativeScore}`;
    
  } else if (name === 'Survival Forecast' && cardMeanings.length === 4) {
    const [runway, resources, threats, action] = cardMeanings;
    narrative = `${runway.name} shows current runway ${runway.orientation === 'upright' ? 'holds steady' : 'burns fast'}. `;
    narrative += `${resources.name} reveals resources ${resources.orientation === 'upright' ? 'available' : 'scarce'}. `;
    narrative += `${threats.name} at threats ${threats.orientation === 'upright' ? 'loom large' : 'stay manageable'}. `;
    narrative += `${action.name} recommends: ${action.orientation === 'upright' ? 'move boldly' : 'hunker down'}.`;
    narrative += `\n\n**Survival outlook:** ${outlook}`;
    
  } else if (name === 'Past/Present/Future' && cardMeanings.length === 3) {
    const [past, present, future] = cardMeanings;
    narrative = `You came from ${past.name} ${past.orientation === 'upright' ? '(favorable ground)' : '(challenging start)'}. `;
    narrative += `Now ${present.name} ${present.orientation === 'upright' ? 'stabilizes' : 'shakes'} your present. `;
    narrative += `${future.name} ahead ${future.orientation === 'upright' ? 'promises growth' : 'warns of storms'}.`;
    narrative += `\n\n**Trajectory insight:** The path moves from ${past.orientation} past through ${present.orientation} present toward ${future.orientation} future.`;
    
  } else if (name === 'Situation/Obstacle/Outcome' && cardMeanings.length === 3) {
    const [situation, obstacle, outcome] = cardMeanings;
    narrative = `${situation.name} defines your situation—${situation.orientation === 'upright' ? 'clear and workable' : 'complex and murky'}. `;
    narrative += `${obstacle.name} blocks the path: ${obstacle.orientation === 'upright' ? 'external force' : 'internal resistance'}. `;
    narrative += `${outcome.name} shows where this leads if you push through—${outcome.orientation === 'upright' ? 'victory awaits' : 'difficulty persists'}.`;
    narrative += `\n\n**Guidance:** ${spread.guidance || 'Navigate carefully'}`;
    
  } else if (name === 'Celtic Cross' && synthesis) {
    // Celtic Cross gets abbreviated narrative + synthesis
    const present = cardMeanings[0];
    const challenge = cardMeanings[1];
    const outcome = cardMeanings[9];
    
    narrative = `${present.name} centers your present ${present.orientation === 'upright' ? 'with strength' : 'in weakness'}. `;
    narrative += `${challenge.name} crosses you—${challenge.orientation === 'upright' ? 'major obstacle' : 'minor friction'}. `;
    narrative += `Through the weave of 10 cards, ${outcome.name} emerges as final outcome ${outcome.orientation === 'upright' ? '(favorable)' : '(difficult)'}.`;
    narrative += `\n\n**Energy:** ${synthesis.energy} | **Trajectory:** ${synthesis.trajectory}`;
    narrative += `\n**Challenge:** ${synthesis.challenge}`;
    narrative += `\n\n**Final word:** ${synthesis.outlook}`;
    
  } else {
    // Fallback: just list cards if unknown spread
    for (const card of cardMeanings) {
      const emoji = card.orientation === "upright" ? "⚡" : "🔄";
      narrative += `${emoji} **${card.position}**: ${card.name} (${card.orientation})\n`;
      narrative += `   ${card.signal}\n\n`;
    }
  }
  
  return narrative;
}

// Generate spread summary (with unified narrative)
function generateSummary(spread) {
  const { name } = spread;
  
  let summary = `## ${name}\n\n`;
  summary += weaveNarrative(spread);
  
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

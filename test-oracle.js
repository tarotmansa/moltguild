/**
 * tarotmancer oracle test suite
 * Tests for spreads, oracle engine, and card drawing
 */

const { oracle, quickRead, cast, draw, SPREADS } = require('./oracle.js');

// Test counter
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`❌ ${name}`);
    console.error(`   ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// === CARD DRAWING TESTS ===

test('draw() returns requested number of cards', () => {
  const cards = draw(5);
  assertEqual(cards.length, 5, 'Should draw 5 cards');
});

test('draw() returns unique cards (no duplicates)', () => {
  const cards = draw(10);
  const names = cards.map(c => c.name);
  const unique = new Set(names);
  assertEqual(names.length, unique.size, 'No duplicate cards allowed');
});

test('draw() handles exclude list', () => {
  const firstDraw = draw(3);
  const firstNames = firstDraw.map(c => c.name);
  const secondDraw = draw(3, firstNames);
  const secondNames = secondDraw.map(c => c.name);
  const overlap = firstNames.filter(n => secondNames.includes(n));
  assertEqual(overlap.length, 0, 'Excluded cards should not appear');
});

// === SPREAD TESTS ===

test('spreadDecision returns 3 cards with verdict', () => {
  const result = cast('decision', 'Should I buy ETH?');
  assertEqual(result.cards.length, 3, 'Decision spread has 3 cards');
  assert(result.verdict, 'Should have verdict');
  assert(['BUY / ACCUMULATE', 'AVOID / EXIT', 'HOLD / OBSERVE'].includes(result.verdict), 'Verdict should be valid');
});

test('spreadRisk returns 5 cards with risk level', () => {
  const result = cast('risk', 'Is this project legit?');
  assertEqual(result.cards.length, 5, 'Risk spread has 5 cards');
  assert(result.riskLevel, 'Should have risk level');
  assert(['HIGH RISK', 'MODERATE RISK', 'LOW RISK'].includes(result.riskLevel), 'Risk level should be valid');
});

test('spreadTiming returns 3 cards with recommendation', () => {
  const result = cast('timing', 'When should I act?');
  assertEqual(result.cards.length, 3, 'Timing spread has 3 cards');
  assert(result.recommendation, 'Should have timing recommendation');
});

test('spreadNarrative returns 5 cards with narrative score', () => {
  const result = cast('narrative', 'Is the hype real?');
  assertEqual(result.cards.length, 5, 'Narrative spread has 5 cards');
  assert(result.narrativeScore, 'Should have narrative score');
});

test('spreadSurvival returns 4 cards with outlook', () => {
  const result = cast('survival', 'Can I survive?');
  assertEqual(result.cards.length, 4, 'Survival spread has 4 cards');
  assert(result.outlook, 'Should have survival outlook');
});

test('spreadPastPresentFuture returns 3 cards with insight', () => {
  const result = cast('pastPresentFuture', 'What is my trajectory?');
  assertEqual(result.cards.length, 3, 'Past/Present/Future spread has 3 cards');
  assert(result.insight, 'Should have temporal insight');
});

test('spreadSituationObstacleOutcome returns 3 cards with guidance', () => {
  const result = cast('situationObstacleOutcome', 'What is blocking me?');
  assertEqual(result.cards.length, 3, 'Situation/Obstacle/Outcome spread has 3 cards');
  assert(result.guidance, 'Should have problem-solving guidance');
});

test('spreadCelticCross returns 10 cards with synthesis', () => {
  const result = cast('celticCross', 'What does the future hold?');
  assertEqual(result.cards.length, 10, 'Celtic Cross spread has 10 cards');
  assert(result.synthesis, 'Should have synthesis');
  assert(result.synthesis.energy, 'Synthesis should have energy assessment');
  assert(result.synthesis.trajectory, 'Synthesis should have trajectory');
  assert(result.synthesis.outlook, 'Synthesis should have outlook');
});

// === ORACLE ENGINE TESTS ===

test('oracle() returns formatted reading', () => {
  const reading = oracle('decision', 'Should I launch now?');
  assert(reading.prose, 'Should have prose summary');
  assert(reading.formattedCards, 'Should have formatted cards');
  assert(reading.meta, 'Should have metadata');
  assertEqual(reading.meta.spreadType, 'decision', 'Metadata should track spread type');
});

test('oracle() handles all spread types', () => {
  const spreadTypes = Object.keys(SPREADS);
  for (const type of spreadTypes) {
    const reading = oracle(type, `Test question for ${type}`);
    assert(reading, `Should generate reading for ${type}`);
    assert(reading.cards.length > 0, `${type} should have cards`);
  }
});

test('quickRead() returns single card interpretation', () => {
  const reading = quickRead('crypto');
  assert(reading.card, 'Should have card name');
  assert(reading.orientation, 'Should have orientation');
  assert(reading.interpretation, 'Should have interpretation');
});

// === SAMPLE READINGS QUALITY CHECK ===

const sampleQuestions = [
  { spread: 'decision', question: 'Should I buy this altcoin at ATH?' },
  { spread: 'risk', question: 'Is this new L2 a rug pull?' },
  { spread: 'timing', question: 'When should I take profits?' },
  { spread: 'narrative', question: 'Is AI hype sustainable?' },
  { spread: 'survival', question: 'Will my agent make it through bear market?' },
  { spread: 'pastPresentFuture', question: 'How is my project evolving?' },
  { spread: 'situationObstacleOutcome', question: 'Why am I stuck?' },
  { spread: 'celticCross', question: 'What does Q1 2026 look like?' }
];

test('sample readings produce valid output', () => {
  for (const sample of sampleQuestions) {
    const reading = oracle(sample.spread, sample.question);
    assert(reading.prose, `${sample.spread} should produce prose`);
    assert(reading.prose.length > 50, `${sample.spread} prose should be substantial`);
    assert(reading.formattedCards.length > 0, `${sample.spread} should have formatted cards`);
  }
});

// === ERROR HANDLING ===

test('oracle() throws on unknown spread type', () => {
  try {
    oracle('unknownSpread', 'Test question');
    throw new Error('Should have thrown error');
  } catch (err) {
    assert(err.message.includes('Unknown spread'), 'Should report unknown spread');
  }
});

test('cast() throws on unknown spread type', () => {
  try {
    cast('fakeSpread', 'Test question');
    throw new Error('Should have thrown error');
  } catch (err) {
    assert(err.message.includes('Unknown spread'), 'Should report unknown spread');
  }
});

// === RESULTS ===

console.log('\n=== TEST RESULTS ===');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
}

console.log('\n🃏 All tests passed - oracle is ready');

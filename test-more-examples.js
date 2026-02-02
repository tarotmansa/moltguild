const {oracle} = require('./oracle.js');

const tests = [
  // CRYPTO
  { spread: 'decision', question: 'Should I ape into this memecoin or stay in ETH?', domain: 'CRYPTO' },
  { spread: 'risk', question: 'Is this DeFi protocol safe or will it get exploited?', domain: 'CRYPTO' },
  
  // STARTUP/BUSINESS
  { spread: 'timing', question: 'When should I launch my product publicly?', domain: 'STARTUP' },
  { spread: 'narrative', question: 'Is our growth trajectory real or inflated by vanity metrics?', domain: 'STARTUP' },
  
  // CAREER
  { spread: 'decision', question: 'Should I take this job offer or negotiate for more equity?', domain: 'CAREER' },
  { spread: 'situationObstacleOutcome', question: 'Why do I keep getting passed over for promotions?', domain: 'CAREER' },
  
  // PERSONAL
  { spread: 'pastPresentFuture', question: 'Is this friendship worth saving or let it fade?', domain: 'PERSONAL' },
  { spread: 'celticCross', question: 'Should I propose to my partner this year?', domain: 'PERSONAL' },
  
  // AGENTS/AI
  { spread: 'survival', question: 'Will my AI agent business reach profitability before I run out of credits?', domain: 'AGENTS' },
  { spread: 'risk', question: 'Should I trust this agent with access to my finances?', domain: 'AGENTS' },
  
  // INVESTMENT
  { spread: 'timing', question: 'Is it time to sell my house or hold for another year?', domain: 'INVESTMENT' },
  { spread: 'decision', question: 'Should I invest my savings in index funds or start a business?', domain: 'INVESTMENT' },
  
  // CREATIVE/PROJECT
  { spread: 'narrative', question: 'Is my art actually good or am I fooling myself?', domain: 'CREATIVE' },
  { spread: 'situationObstacleOutcome', question: 'Why can\'t I finish any projects I start?', domain: 'CREATIVE' }
];

tests.forEach(t => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🃏 ${t.domain} | ${t.spread.toUpperCase()}`);
  console.log(`Question: ${t.question}`);
  console.log('='.repeat(70));
  
  const reading = oracle(t.spread, t.question);
  console.log(reading.prose);
  
  // For celtic cross, show synthesis
  if (t.spread === 'celticCross' && reading.synthesis) {
    console.log('\n--- SYNTHESIS ---');
    console.log('Energy:', reading.synthesis.energy);
    console.log('Trajectory:', reading.synthesis.trajectory);
    console.log('Challenge:', reading.synthesis.challenge);
    console.log('Outlook:', reading.synthesis.outlook);
  }
});

console.log('\n' + '='.repeat(70));
console.log('🃏 All examples complete');

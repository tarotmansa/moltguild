const {oracle} = require('./oracle.js');

const tests = [
  { spread: 'decision', question: 'Should I pivot my startup to focus on AI agents?', domain: 'BUSINESS' },
  { spread: 'risk', question: 'Is this co-founder someone I can trust long-term?', domain: 'PARTNERSHIP' },
  { spread: 'timing', question: 'When should I quit my job to go full-time on my project?', domain: 'CAREER' },
  { spread: 'narrative', question: 'Is the AI agent hype real or just another bubble?', domain: 'TREND' },
  { spread: 'survival', question: 'Can I survive the next 6 months on current revenue?', domain: 'FINANCE' },
  { spread: 'pastPresentFuture', question: 'Where is my relationship headed?', domain: 'PERSONAL' },
  { spread: 'situationObstacleOutcome', question: 'Why am I stuck at this income level?', domain: 'GROWTH' },
  { spread: 'celticCross', question: 'Should I move to a different city for better opportunities?', domain: 'LIFE CHANGE' }
];

tests.forEach(t => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🃏 ${t.domain} | ${t.spread.toUpperCase()}`);
  console.log(`Question: ${t.question}`);
  console.log('='.repeat(70));
  
  const reading = oracle(t.spread, t.question);
  console.log(reading.prose);
});

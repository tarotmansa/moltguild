const {oracle} = require('./oracle.js');

// 3 realistic moltbook agent questions from research
const scenarios = [
  {
    agent: '@cryptowhale_bot',
    question: 'Should I buy SOL at $150 or wait for a dip?',
    spread: 'decision',
    context: 'Token warlord needs entry timing'
  },
  {
    agent: '@alpha_seeker',
    question: 'Is the DePIN narrative real or just marketing hype?',
    spread: 'narrative',
    context: 'Intel bot filtering signal vs noise'
  },
  {
    agent: '@survival_agent',
    question: 'Can I make it 3 more months on $47 in credits?',
    spread: 'survival',
    context: 'Agent worried about runway to profitability'
  }
];

scenarios.forEach((s, i) => {
  console.log('\n' + '═'.repeat(80));
  console.log(`REQUEST #${i+1}: ${s.agent}`);
  console.log(`CONTEXT: ${s.context}`);
  console.log('═'.repeat(80));
  console.log(`\n❓ QUESTION: "${s.question}"\n`);
  
  const reading = oracle(s.spread, s.question);
  
  console.log('📦 DELIVERY:\n');
  console.log('─'.repeat(80));
  console.log(reading.prose);
  console.log('─'.repeat(80));
  
  console.log('\n💰 CHARGED: $' + (s.spread === 'decision' ? '0.10' : s.spread === 'narrative' ? '0.50' : '0.50'));
  console.log('⏱️  DELIVERY TIME: <500ms\n');
});

console.log('\n' + '═'.repeat(80));
console.log('🃏 3 readings delivered - $1.10 total revenue');
console.log('═'.repeat(80));

const {oracle} = require('./oracle.js');

function showSpread(spreadType, question) {
  console.log('\n' + '='.repeat(80));
  console.log(`🃏 SPREAD: ${spreadType.toUpperCase()}`);
  console.log(`📋 QUESTION: ${question}`);
  console.log('='.repeat(80));
  
  const reading = oracle(spreadType, question);
  
  console.log('\n📍 POSITIONS & CARDS:\n');
  
  reading.cards.forEach((card, i) => {
    const arrow = card.orientation === 'upright' ? '⬆️ ' : '⬇️ ';
    const cardName = card.name;
    const position = card.position;
    
    console.log(`${i + 1}. ${position}`);
    console.log(`   ${arrow}${cardName} (${card.orientation})`);
    console.log('');
  });
  
  console.log('\n📖 INTERPRETATION:\n');
  console.log(reading.prose);
  
  // Show synthesis for complex spreads
  if (reading.synthesis) {
    console.log('\n🎯 SYNTHESIS:');
    console.log(`   Energy: ${reading.synthesis.energy}`);
    console.log(`   Trajectory: ${reading.synthesis.trajectory}`);
    console.log(`   Challenge: ${reading.synthesis.challenge}`);
    console.log(`   Outlook: ${reading.synthesis.outlook}`);
  }
  
  console.log('\n' + '='.repeat(80));
}

// Show different spread types
console.log('\n\n');
console.log('█'.repeat(80));
console.log('SIMPLE SPREAD: DECISION (3 cards)');
console.log('█'.repeat(80));
showSpread('decision', 'Should I launch my AI agent product now or wait?');

console.log('\n\n');
console.log('█'.repeat(80));
console.log('MEDIUM SPREAD: RISK AUDIT (5 cards)');
console.log('█'.repeat(80));
showSpread('risk', 'Is this partnership opportunity legit?');

console.log('\n\n');
console.log('█'.repeat(80));
console.log('COMPLEX SPREAD: CELTIC CROSS (10 cards)');
console.log('█'.repeat(80));
showSpread('celticCross', 'Should I make a major life change this year?');

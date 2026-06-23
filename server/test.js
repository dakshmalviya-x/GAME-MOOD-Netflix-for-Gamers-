import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('🧪 Starting backend verification tests...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gamesPath = path.join(__dirname, 'data', 'games.json');

try {
  // Test 1: Verify data exists and is valid JSON
  console.log('- Test 1: Reading games.json database...');
  const rawData = fs.readFileSync(gamesPath, 'utf8');
  const games = JSON.parse(rawData);
  console.log(`✅ Success! Loaded ${games.length} games.`);

  // Test 2: Verify game objects have necessary attributes
  console.log('- Test 2: Verifying schema integrity of all entries...');
  games.forEach((game, index) => {
    const required = ['id', 'title', 'energy', 'commitment', 'playstyle', 'vibes', 'rating', 'releaseYear'];
    required.forEach(prop => {
      if (game[prop] === undefined) {
        throw new Error(`Entry at index ${index} (${game.title || 'Unknown'}) is missing property: ${prop}`);
      }
    });
  });
  console.log('✅ Success! All games conform to the schema.');

  // Test 3: Recommendation quiz algorithm dry run
  console.log('- Test 3: Simulating quiz matching algorithm...');
  
  const mockQuizAnswers = {
    energy: 'chill',
    commitment: 'long',
    playstyle: 'co-op',
    vibe: 'cozy'
  };

  const results = games.map(game => {
    let score = 0;
    if (game.energy === mockQuizAnswers.energy) score += 3;
    if (game.commitment === mockQuizAnswers.commitment) score += 2;
    if (game.playstyle === mockQuizAnswers.playstyle) score += 2;
    if (game.vibes.includes(mockQuizAnswers.vibe)) score += 3;
    
    const ratingWeight = game.rating / 10;
    const totalScore = score + ratingWeight;
    const fitPercentage = Math.min(Math.round((totalScore / 11) * 100), 100);
    return { title: game.title, score: totalScore, fitPercentage };
  }).sort((a, b) => b.score - a.score);

  console.log('Quiz recommendation results for "Chill, Long, Co-op, Cozy":');
  results.slice(0, 3).forEach((r, idx) => {
    console.log(`  ${idx + 1}. ${r.title} (Fit: ${r.fitPercentage}%, Score: ${r.score.toFixed(2)})`);
  });
  
  if (results[0].title !== 'Stardew Valley' && results[0].title !== 'Terraria') {
    throw new Error(`Unexpected recommendation result: ${results[0].title}`);
  }
  console.log('✅ Success! Recommendation engine matches correctly.');

  console.log('\n🎉 All backend validation tests passed successfully!');
} catch (err) {
  console.error('\n❌ Test execution failed!');
  console.error(err);
  process.exit(1);
}

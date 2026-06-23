import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gamesFilePath = path.join(__dirname, '..', 'data', 'games.json');

// Helper to load internal games list
async function loadGames() {
  const data = await fs.readFile(gamesFilePath, 'utf8');
  return JSON.parse(data);
}

// Maps seed game format to include dynamic image paths
function formatLocalGame(game) {
  const fallbackThumbnail = '/images/game-placeholder.svg';
  const steamThumbnail = game.steamAppId
    ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.steamAppId}/header.jpg`
    : fallbackThumbnail;

  return {
    ...game,
    thumbnail: steamThumbnail || fallbackThumbnail
  };
}

// GET /api/games/trending
router.get('/trending', async (req, res) => {
  try {
    const apiKey = process.env.RAWG_API_KEY;

    if (apiKey) {
      // Fetch live trending PC games from RAWG API
      try {
        const response = await fetch(
          `https://api.rawg.io/api/games?key=${apiKey}&platforms=4&ordering=-added&page_size=8`
        );
        const data = await response.json();
        
        if (data.results) {
          const games = data.results.map(g => ({
            id: String(g.id),
            title: g.name,
            steamAppId: null, // RAWG ID can be resolved if needed, or left null
            description: `Released: ${g.released}. Average rating: ${g.rating}/5. Play on PC.`,
            genre: g.genres.map(genre => genre.name).join(' / '),
            rating: parseFloat((g.rating * 2).toFixed(1)), // convert to 10-point scale
            releaseYear: g.released ? new Date(g.released).getFullYear() : 'Unknown',
            thumbnail: g.background_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop'
          }));
          return res.json(games);
        }
      } catch (rawgErr) {
        console.error('Error fetching trending from RAWG:', rawgErr);
        // Fallback to local on API failure
      }
    }

    // Default: Sort local seed games by rating and take the top 8
    const localGames = await loadGames();
    const sorted = [...localGames]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8)
      .map(formatLocalGame);

    res.json(sorted);
  } catch (err) {
    console.error('Trending endpoint error:', err);
    res.status(500).json({ error: 'Server error loading trending games.' });
  }
});

// GET /api/games/explore (Search and Filter catalog)
router.get('/explore', async (req, res) => {
  try {
    const { q, genre } = req.query;
    const apiKey = process.env.RAWG_API_KEY;

    if (apiKey) {
      try {
        let url = `https://api.rawg.io/api/games?key=${apiKey}&platforms=4&page_size=20`;
        if (q) url += `&search=${encodeURIComponent(q)}`;
        if (genre) {
          // Map popular genres to slugs or pass along
          url += `&genres=${genre.toLowerCase()}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
          const games = data.results.map(g => ({
            id: String(g.id),
            title: g.name,
            steamAppId: null,
            description: `Vibe: ${g.genres.map(gen => gen.name).join(', ')}. Rating: ${g.rating}/5.`,
            genre: g.genres.map(gen => gen.name).join(' / '),
            rating: parseFloat((g.rating * 2).toFixed(1)),
            releaseYear: g.released ? new Date(g.released).getFullYear() : 'Unknown',
            thumbnail: g.background_image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop'
          }));
          return res.json(games);
        }
      } catch (rawgErr) {
        console.error('Error fetching explore from RAWG:', rawgErr);
        // Fallback to local
      }
    }

    // Default Local Filter logic
    const localGames = await loadGames();
    let results = localGames.map(formatLocalGame);

    if (q) {
      const query = q.toLowerCase();
      results = results.filter(
        g => g.title.toLowerCase().includes(query) || g.description.toLowerCase().includes(query)
      );
    }

    if (genre) {
      const activeGenre = genre.toLowerCase();
      results = results.filter(g => g.genre.toLowerCase().includes(activeGenre));
    }

    res.json(results);
  } catch (err) {
    console.error('Explore games error:', err);
    res.status(500).json({ error: 'Server error loading games catalog.' });
  }
});

// POST /api/games/recommend (Quiz Match Engine)
router.post('/recommend', async (req, res) => {
  try {
    const { energy, commitment, playstyle, vibe, isPremiumFilter } = req.body;

    if (!energy || !commitment || !playstyle || !vibe) {
      return res.status(400).json({ error: 'All quiz answers (energy, commitment, playstyle, vibe) are required.' });
    }

    const localGames = await loadGames();
    const scoredGames = localGames.map(game => {
      let score = 0;

      // Match Energy Level (3 points)
      if (game.energy === energy) {
        score += 3;
      }

      // Match Commitment Level (2 points)
      if (game.commitment === commitment) {
        score += 2;
      }

      // Match Playstyle (2 points)
      if (game.playstyle === playstyle) {
        score += 2;
      } else if (game.playstyle === 'co-op' && playstyle === 'solo') {
        // Co-op games can be played solo
        score += 1;
      }

      // Match Vibes (2 points per matched vibe)
      const vibeMatches = game.vibes.includes(vibe.toLowerCase());
      if (vibeMatches) {
        score += 3; // exact vibe match is high priority
      }

      // Add a small tie-breaker based on rating
      const ratingWeight = game.rating / 10;

      const totalScore = score + ratingWeight;
      
      // Calculate fit percentage (max score possible ~ 9 + ratingWeight)
      const maxPossibleScore = 11;
      const fitPercentage = Math.min(Math.round((totalScore / maxPossibleScore) * 100), 100);

      return {
        ...formatLocalGame(game),
        score: parseFloat(totalScore.toFixed(2)),
        fitPercentage
      };
    });

    // Sort by score desc, rating desc
    let recommended = scoredGames.sort((a, b) => b.score - a.score || b.rating - a.rating);

    // Apply Premium specific refinements (if unlocked)
    if (isPremiumFilter) {
      // E.g., Filter out older games or only include games rated > 8.5
      recommended = recommended.filter(g => g.rating >= 8.5);
    }

    // Return the top 4 matches
    res.json(recommended.slice(0, 4));
  } catch (err) {
    console.error('Recommendation engine error:', err);
    res.status(500).json({ error: 'Server error processing recommendations.' });
  }
});

export default router;

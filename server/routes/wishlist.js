import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wishlistFilePath = path.join(__dirname, '..', 'data', 'wishlists.json');
const gamesFilePath = path.join(__dirname, '..', 'data', 'games.json');

// Helper to load wishlists
async function loadWishlists() {
  try {
    const data = await fs.readFile(wishlistFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

// Helper to save wishlists
async function saveWishlists(wishlists) {
  await fs.mkdir(path.dirname(wishlistFilePath), { recursive: true });
  await fs.writeFile(wishlistFilePath, JSON.stringify(wishlists, null, 2), 'utf8');
}

// Helper to load internal games (for details matching)
async function loadGames() {
  try {
    const data = await fs.readFile(gamesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// GET /api/wishlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlists = await loadWishlists();
    const userWishlist = wishlists[userId] || [];

    // Load local games to augment details if matching local IDs
    const games = await loadGames();
    
    // Construct rich details for response
    const richWishlist = userWishlist.map(savedGame => {
      // If it's a local game, populate or overwrite details from the master list
      const matchedLocal = games.find(g => g.id === savedGame.id);
      if (matchedLocal) {
        return {
          ...savedGame,
          ...matchedLocal,
          thumbnail: matchedLocal.steamAppId
            ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${matchedLocal.steamAppId}/header.jpg`
            : savedGame.thumbnail || '/images/game-placeholder.svg'
        };
      }
      return savedGame; // Return custom/RAWG game metadata directly
    });

    res.json(richWishlist);
  } catch (err) {
    console.error('Fetch wishlist error:', err);
    res.status(500).json({ error: 'Server error loading wishlist.' });
  }
});

// POST /api/wishlist
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { game } = req.body;

    if (!game || !game.id || !game.title) {
      return res.status(400).json({ error: 'Invalid game details. Game must have ID and Title.' });
    }

    const wishlists = await loadWishlists();
    if (!wishlists[userId]) {
      wishlists[userId] = [];
    }

    // Check duplicate
    const exists = wishlists[userId].some(g => g.id === game.id);
    if (exists) {
      return res.status(409).json({ error: 'Game is already in your wishlist.' });
    }

    // Clean up fields to store
    const gameToSave = {
      id: game.id,
      title: game.title,
      genre: game.genre || 'Action / RPG',
      rating: game.rating || 8.0,
      releaseYear: game.releaseYear || 'Unknown',
      thumbnail: game.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop',
      steamAppId: game.steamAppId || null,
      addedAt: new Date().toISOString()
    };

    wishlists[userId].push(gameToSave);
    await saveWishlists(wishlists);

    res.status(201).json({ message: 'Added to wishlist!', game: gameToSave });
  } catch (err) {
    console.error('Add to wishlist error:', err);
    res.status(500).json({ error: 'Server error adding to wishlist.' });
  }
});

// DELETE /api/wishlist/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const gameId = req.params.id;

    const wishlists = await loadWishlists();
    if (!wishlists[userId]) {
      return res.status(404).json({ error: 'Wishlist is empty.' });
    }

    const originalLength = wishlists[userId].length;
    wishlists[userId] = wishlists[userId].filter(g => g.id !== gameId);

    if (wishlists[userId].length === originalLength) {
      return res.status(404).json({ error: 'Game not found in wishlist.' });
    }

    await saveWishlists(wishlists);
    res.json({ message: 'Removed from wishlist successfully.' });
  } catch (err) {
    console.error('Delete wishlist item error:', err);
    res.status(500).json({ error: 'Server error removing item from wishlist.' });
  }
});

export default router;

import express from 'express';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Map CheapShark Store IDs to names
const storeMap = {
  '1': 'Steam',
  '2': 'GamersGate',
  '3': 'GreenManGaming',
  '7': 'GOG.com',
  '11': 'Humble Store',
  '15': 'Fanatical',
  '25': 'Epic Games Store',
  '30': 'IndieGala'
};

// GET /api/deals
// Restricted to Premium members only
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check premium status
    if (!req.user.isPremium) {
      return res.status(403).json({
        error: 'Premium Only Feature',
        message: 'Please upgrade your account to Premium (500 Rs) to access live Steam deals and discounts!'
      });
    }

    const { steamAppId, title } = req.query;

    if (!steamAppId && !title) {
      return res.status(400).json({ error: 'Please provide either steamAppId or title.' });
    }

    let url = '';
    if (steamAppId && steamAppId !== 'null' && steamAppId !== 'undefined' && steamAppId !== '0') {
      url = `https://www.cheapshark.com/api/1.0/deals?steamAppID=${steamAppId}&limit=5`;
    } else {
      url = `https://www.cheapshark.com/api/1.0/deals?title=${encodeURIComponent(title)}&limit=5`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`CheapShark API returned status ${response.status}`);
    }

    const data = await response.json();

    // Map deals to clean frontend format
    const formattedDeals = data.map(deal => {
      const storeName = storeMap[deal.storeID] || 'PC Retailer';
      const savingsPercent = Math.round(parseFloat(deal.savings));
      return {
        dealId: deal.dealID,
        storeName,
        salePrice: parseFloat(deal.salePrice),
        normalPrice: parseFloat(deal.normalPrice),
        savingsPercent,
        dealLink: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`
      };
    });

    // Remove duplicates from the same store and sort by lowest sale price
    const uniqueDeals = [];
    const storesSeen = new Set();

    for (const deal of formattedDeals) {
      if (!storesSeen.has(deal.storeName)) {
        storesSeen.add(deal.storeName);
        uniqueDeals.push(deal);
      }
    }

    res.json(uniqueDeals.sort((a, b) => a.salePrice - b.salePrice));
  } catch (err) {
    console.error('Fetch deals error:', err);
    res.status(500).json({ error: 'Failed to fetch game deals at this time.' });
  }
});

export default router;

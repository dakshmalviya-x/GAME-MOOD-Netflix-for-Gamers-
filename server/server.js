import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import gamesRoutes from './routes/games.js';
import wishlistRoutes from './routes/wishlist.js';
import dealsRoutes from './routes/deals.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all client connections for simple local development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/deals', dealsRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'GameMood API Server is running smoothly.',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 GameMood API Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/`);
  console.log(`=========================================`);
});

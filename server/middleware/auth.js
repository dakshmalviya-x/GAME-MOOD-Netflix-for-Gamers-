import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Malformed authorization header. Format should be: Bearer <token>' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gamemood_super_secret_signing_key_2026');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token. Please log in again.' });
  }
}

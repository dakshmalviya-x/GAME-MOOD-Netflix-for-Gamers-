const DEFAULT_API_BASE = 'https://game-mood-netflix-for-gamers.onrender.com';

export function apiUrl(path) {
  const rawBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : DEFAULT_API_BASE);
  const base = (rawBase || '').replace(/\/$/, '');
  return `${base}${path}`;
}

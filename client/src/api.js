const DEFAULT_API_BASE = 'https://game-mood-netflix-for-gamers.onrender.com';

export function apiUrl(path) {
  const envBase = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_URL : '';
  const rawBase = envBase || (import.meta.env?.DEV ? '' : DEFAULT_API_BASE);
  const base = (rawBase || '').replace(/\/$/, '');
  return `${base}${path}`;
}

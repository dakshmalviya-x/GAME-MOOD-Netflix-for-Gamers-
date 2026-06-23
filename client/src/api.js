const API_BASE = 'https://game-mood-netflix-for-gamers.onrender.com';

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

/**
 * PKL Auction mock data used by RoomSetup and AuctionRoom.
 * Replace with backend/socket data when real-time services are wired.
 */
import players from './pkl_players.json';
import { enrichPlayersWithStats } from './playerStatsLoader';

let cachedPKLPlayers = null;

/**
 * Get PKL players with enriched stats (async)
 * This will load and cache player stats from CSV files
 */
export async function getPKLPlayers() {
  if (cachedPKLPlayers) {
    return cachedPKLPlayers;
  }

  const basePlayersWithoutStats = (players || []).map(p => ({
    id: p.id,
    name: p.name,
    team: p.team,
    role: p.role,
    basePrice: p.basePrice || 1.0,
    image: p.image || '',
  }));

  cachedPKLPlayers = await enrichPlayersWithStats(basePlayersWithoutStats);
  return cachedPKLPlayers;
}

/**
 * Fallback synchronous version for immediate access
 * Returns players without stats - use getPKLPlayers() for enriched data
 */
export const PKL_PLAYERS = (players || []).map(p => ({
  id: p.id,
  name: p.name,
  team: p.team,
  role: p.role,
  basePrice: p.basePrice || 1.0,
  image: p.image || '',
  stats: p.stats || { raids: 0, points: 0, matches: 0, hasStats: false },
}));

export const TEAM_COLORS = [
  '#009B4D', '#FFCC00', '#8B5CF6', '#EF4444', '#3B82F6',
  '#F97316', '#06B6D4', '#EC4899', '#10B981', '#6366F1',
];

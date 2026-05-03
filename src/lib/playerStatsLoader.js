/**
 * Player Stats Loader - Merges stats from multiple CSV sources
 * Priority: total_points.csv > (raiders.csv + tackles.csv)
 */

/**
 * Parse CSV data into an array of objects
 * @param {string} csvData - Raw CSV data
 * @returns {Array} Parsed CSV data
 */
function parseCSV(csvData) {
  const lines = csvData.trim().split('\n');
  if (lines.length < 1) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};

    headers.forEach((header, idx) => {
      const value = values[idx];
      // Convert numeric fields
      if (['matches', 'raid_points', 'defence_points', 'total_points', 'rank'].includes(header)) {
        row[header] = parseInt(value, 10) || 0;
      } else {
        row[header] = value;
      }
    });

    data.push(row);
  }

  return data;
}

/**
 * Normalize player name for matching (case-insensitive, trimmed)
 * @param {string} name - Player name
 * @returns {string} Normalized name
 */
function normalizeName(name) {
  return (name || '').toLowerCase().trim();
}

/**
 * Fetch and parse CSV file
 * @param {string} path - Path to CSV file
 * @returns {Promise<Array>} Parsed CSV data
 */
async function fetchAndParseCSV(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      console.warn(`Failed to load CSV from ${path}`);
      return [];
    }
    const csvData = await response.text();
    return parseCSV(csvData);
  } catch (error) {
    console.warn(`Error loading CSV from ${path}:`, error);
    return [];
  }
}

/**
 * Load and merge all player stats
 * @returns {Promise<Object>} Map of normalized player names to stats
 */
async function loadPlayerStatsAsync() {
  // Load from Datasets folder - adjust paths based on your setup
  const totalPoints = await fetchAndParseCSV('/Datasets/total_points.csv');
  const raiders = await fetchAndParseCSV('/Datasets/raiders.csv');
  const tackles = await fetchAndParseCSV('/Datasets/tackles.csv');

  const statsMap = {};

  // 1. Primary source: total_points.csv (highest priority)
  totalPoints.forEach(player => {
    const normalizedName = normalizeName(player.name);
    statsMap[normalizedName] = {
      source: 'total_points',
      matches: player.matches || 0,
      raid_points: player.raid_points || 0,
      defence_points: player.defence_points || 0,
      total_points: player.total_points || 0,
    };
  });

  // 2. Secondary source: raiders.csv (for raiders not in total_points)
  raiders.forEach(player => {
    const normalizedName = normalizeName(player.name);
    if (!statsMap[normalizedName]) {
      const tacklesPlayer = tackles.find(t => normalizeName(t.name) === normalizedName);
      statsMap[normalizedName] = {
        source: 'combined',
        matches: Math.max(player.matches || 0, tacklesPlayer?.matches || 0),
        raid_points: player.raid_points || 0,
        defence_points: tacklesPlayer?.defence_points || 0,
        total_points: (player.raid_points || 0) + (tacklesPlayer?.defence_points || 0),
      };
    }
  });

  // 3. Secondary source: tackles.csv (for defenders not in total_points or raiders)
  tackles.forEach(player => {
    const normalizedName = normalizeName(player.name);
    if (!statsMap[normalizedName]) {
      statsMap[normalizedName] = {
        source: 'tackles',
        matches: player.matches || 0,
        raid_points: 0,
        defence_points: player.defence_points || 0,
        total_points: player.defence_points || 0,
      };
    }
  });

  return statsMap;
}

/**
 * Get stats for a player with fallback to "NYP" for new players
 * @param {string} playerName - Player name
 * @param {Object} statsMap - Pre-loaded stats map
 * @returns {Object} Player stats object
 */
export function getPlayerStats(playerName, statsMap) {
  const normalizedName = normalizeName(playerName);
  const stats = statsMap[normalizedName];

  if (stats) {
    // Existing player - show numeric stats
    return {
      matches: stats.matches,
      raids: stats.raid_points,
      points: stats.total_points,
      defence: stats.defence_points,
      exists: true,
    };
  }

  // New player - show "NYP"
  return {
    matches: 'NYP',
    raids: 'NYP',
    points: 'NYP',
    defence: 'NYP',
    exists: false,
  };
}

/**
 * Lazy-load and cache stats with async support
 */
let cachedStatsMap = null;
let loadingPromise = null;

export async function getStatsMap() {
  if (cachedStatsMap) {
    return cachedStatsMap;
  }

  if (!loadingPromise) {
    loadingPromise = loadPlayerStatsAsync();
  }

  cachedStatsMap = await loadingPromise;
  return cachedStatsMap;
}

/**
 * Get enriched player object with stats (async version)
 * @param {Object} player - Base player object (from pkl_players.json)
 * @returns {Promise<Object>} Player object with enriched stats
 */
export async function enrichPlayerWithStats(player) {
  const statsMap = await getStatsMap();
  const stats = getPlayerStats(player.name, statsMap);

  return {
    ...player,
    stats: {
      raids: stats.raids,
      points: stats.points,
      matches: stats.matches,
      defence: stats.defence,
      hasStats: stats.exists,
    },
  };
}

/**
 * Enrich multiple players with stats
 * @param {Array} players - Array of player objects
 * @returns {Promise<Array>} Players with enriched stats
 */
export async function enrichPlayersWithStats(players) {
  return Promise.all(players.map(p => enrichPlayerWithStats(p)));
}

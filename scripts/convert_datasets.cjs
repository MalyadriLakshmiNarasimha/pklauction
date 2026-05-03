const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const datasetsDir = path.join(repoRoot, 'Datasets');
const outDir = path.join(repoRoot, 'src', 'lib');
const outFile = path.join(outDir, 'pkl_players.json');

// CLI options
const args = process.argv.slice(2);
const options = args.reduce((acc, cur) => {
  const [k, v] = cur.split('=');
  if (k.startsWith('--')) acc[k.replace(/^--/, '')] = v === undefined ? true : v;
  return acc;
}, {});

const DEFAULT_BASE_PRICE = 0.3; // 30 lakhs -> 0.3 Cr
const basePrice = parseFloat(options.basePrice) || DEFAULT_BASE_PRICE;
const order = (options.order || '').toLowerCase(); // 'random' | 'category' | ''

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function parseCsv(content) {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = lines.slice(1);
  return rows.map(line => {
    const cols = line.split(',').map(c => c.trim());
    return {
      name: cols[0] || '',
      role: cols[1] || '',
      team: cols[2] || '',
    };
  }).filter(r => r.name);
}

function collect() {
  if (!fs.existsSync(datasetsDir)) {
    console.error('Datasets directory not found:', datasetsDir);
    process.exit(1);
  }
  const files = fs.readdirSync(datasetsDir).filter(f => f.toLowerCase().endsWith('.csv'));
  const players = [];
  files.forEach(file => {
    const content = fs.readFileSync(path.join(datasetsDir, file), 'utf8');
    const parsed = parseCsv(content);
    parsed.forEach(p => players.push({ ...p }));
  });

  let normalized = players.map((p, i) => ({
    id: i + 1,
    name: p.name.trim(),
    role: p.role.trim(),
    team: p.team.trim(),
    basePrice: basePrice,
    image: '',
    stats: { raids: 0, points: 0, matches: 0 }
  }));

  // Re-ordering options
  if (order === 'random') {
    shuffle(normalized);
  } else if (order === 'category') {
    // group by role (category) while preserving within-group order
    const groups = {};
    normalized.forEach(p => {
      const key = (p.role || 'Unknown').toLowerCase();
      groups[key] = groups[key] || [];
      groups[key].push(p);
    });
    normalized = Object.keys(groups).sort().reduce((acc, k) => acc.concat(groups[k]), []);
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(normalized, null, 2), 'utf8');
  console.log('Wrote', outFile, 'with', normalized.length, 'players');
}

collect();

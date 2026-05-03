const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const datasetsDir = path.join(repoRoot, 'Datasets');
const outDir = path.join(repoRoot, 'src', 'lib');
const outFile = path.join(outDir, 'pkl_players.json');

function parseCsv(content) {
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = lines.slice(1);
  return rows.map(line => {
    const cols = line.split(',').map(c => c.trim());
    // expecting name, role, team
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

  // normalize and add defaults
  const normalized = players.map((p, i) => ({
    id: i + 1,
    name: p.name.trim(),
    role: p.role.trim(),
    team: p.team.trim(),
    basePrice: 1.0,
    image: '',
    stats: { raids: 0, points: 0, matches: 0 }
  }));

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(normalized, null, 2), 'utf8');
  console.log('Wrote', outFile, 'with', normalized.length, 'players');
}

collect();

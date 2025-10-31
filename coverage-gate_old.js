const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const THRESHOLD = Number(process.env.COVERAGE_MIN || 80);

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

try { run('npm ci'); } catch { console.warn('npm ci falhou; tentando npm install...'); run('npm install'); }

run('npm run tests -- --coverageReporters=json-summary --coverageReporters=json --coverageReporters=text-summary --coverageReporters=lcov');

const pSummary = path.join('coverage', 'coverage-summary.json');
const pFinal   = path.join('coverage', 'coverage-final.json');

function computeTotalsFromFinal(finalJson) {
  const totals = {
    statements: { covered: 0, total: 0 },
    branches:   { covered: 0, total: 0 },
    functions:  { covered: 0, total: 0 },
    lines:      { covered: 0, total: 0 },
  };
  for (const file of Object.values(finalJson)) {
    if (file.s) {
      const vals = Object.values(file.s);
      totals.statements.total   += vals.length;
      totals.statements.covered += vals.filter(v => v > 0).length;
    }
    if (file.b) {
      const arrs = Object.values(file.b);
      totals.branches.total   += arrs.reduce((acc, a) => acc + a.length, 0);
      totals.branches.covered += arrs.reduce((acc, a) => acc + a.filter(v => v > 0).length, 0);
    }
    if (file.f) {
      const vals = Object.values(file.f);
      totals.functions.total   += vals.length;
      totals.functions.covered += vals.filter(v => v > 0).length;
    }
    if (file.l) {
      const vals = Object.values(file.l);
      totals.lines.total   += vals.length;
      totals.lines.covered += vals.filter(v => v > 0).length;
    }
  }
  const pct = (c, t) => (t ? +( (c / t) * 100 ).toFixed(2) : 100);
  return {
    statements: { pct: pct(totals.statements.covered, totals.statements.total) },
    branches:   { pct: pct(totals.branches.covered,   totals.branches.total)   },
    functions:  { pct: pct(totals.functions.covered,  totals.functions.total)  },
    lines:      { pct: pct(totals.lines.covered,      totals.lines.total)      },
  };
}

let coverage;
if (fs.existsSync(pSummary)) {
  console.log(`\nCobertura carregada de: ${pSummary}`);
  const summary = JSON.parse(fs.readFileSync(pSummary, 'utf8'));
  coverage = summary.total || summary;
} else if (fs.existsSync(pFinal)) {
  console.log(`\nCobertura carregada de: ${pFinal}`);
  const final = JSON.parse(fs.readFileSync(pFinal, 'utf8'));
  coverage = computeTotalsFromFinal(final);
} else {
  console.error('Não foi possível encontrar coverage-summary.json nem coverage-final.json.');
  process.exit(2);
}

const current = {
  statements: coverage.statements?.pct ?? null,
  branches:   coverage.branches?.pct   ?? null,
  functions:  coverage.functions?.pct  ?? null,
  lines:      coverage.lines?.pct      ?? null,
};

const headers = ['Métrica', 'Atual (%)', 'Limite (%)', 'Status'];
const rows = [
  ['Statements', current.statements, THRESHOLD, ''],
  ['Branches',   current.branches,   THRESHOLD, ''],
  ['Functions',  current.functions,  THRESHOLD, ''],
  ['Lines',      current.lines,      THRESHOLD, ''],
];

let fail = false;
for (const r of rows) {
  const ok = r[1] !== null && r[1] >= r[2];
  r[3] = ok ? 'OK' : 'FAIL';
  if (!ok) fail = true;
}

const pad = (s, w) => String(s).padEnd(w, ' ');
const widths = [12, 12, 12, 8];
console.log('\nCobertura (Jest):\n');
console.log(pad(headers[0], widths[0]), pad(headers[1], widths[1]), pad(headers[2], widths[2]), pad(headers[3], widths[3]));
for (const r of rows) console.log(pad(r[0], widths[0]), pad(r[1], widths[1]), pad(r[2], widths[2]), pad(r[3], widths[3]));

if (fail) {
  console.error(`\nCobertura abaixo de ${THRESHOLD}% em uma ou mais métricas.`);
  process.exit(1);
}
console.log(`\nCobertura >= ${THRESHOLD}% em todas as métricas. ✅`);

// coverage-gate.js
// Valida SOMENTE Statements e Lines >= COVERAGE_MIN (default 80)
// Roda os testes com cobertura, garante coverage-summary.json e faz o gate.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const THRESHOLD = Number(process.env.COVERAGE_MIN || 80);

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

// 1) Dependências (útil no CI; localmente pode já estar instalado)
try { run('npm ci'); } catch { console.warn('npm ci falhou; tentando npm install...'); run('npm install'); }

// 2) Executa testes gerando summary
//    Usa seu script "tests" (assim o posttests também roda e mantém compatível com o desafio)
run('npm run tests -- --coverageReporters=json --coverageReporters=json-summary --coverageReporters=text-summary --coverageReporters=lcov');

// 3) Lê coverage-summary.json
const summaryPath = path.join('coverage', 'coverage-summary.json');
if (!fs.existsSync(summaryPath)) {
  console.error('coverage/coverage-summary.json não encontrado.');
  process.exit(2);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const total = summary.total || summary;

// 4) Extrai métricas alvo
const statements = total.statements?.pct ?? null;
const lines = total.lines?.pct ?? null;

// 5) Mostra tabela e aplica gate SOMENTE em Statements e Lines
function pad(s, w) { s = String(s); return s + ' '.repeat(Math.max(0, w - s.length)); }
const headers = ['Métrica', 'Atual (%)', 'Limite (%)', 'Status'];
const rows = [
  ['Statements', statements, THRESHOLD, ''],
  ['Lines',      lines,      THRESHOLD, ''],
];

let fail = false;
for (const r of rows) {
  const ok = r[1] !== null && r[1] >= r[2];
  r[3] = ok ? 'OK' : 'FAIL';
  if (!ok) fail = true;
}

console.log('\nCobertura (Gate limitado a Statements e Lines):\n');
console.log(pad(headers[0], 12), pad(headers[1], 12), pad(headers[2], 12), pad(headers[3], 8));
for (const r of rows) console.log(pad(r[0], 12), pad(r[1], 12), pad(r[2], 12), pad(r[3], 8));

if (fail) {
  console.error(`\nFalha: Statements/Lines abaixo de ${THRESHOLD}%.\nDica: aumente testes ou reduza COVERAGE_MIN (se for aceitável).`);
  process.exit(1);
}

console.log(`\n✅ Gate aprovado: Statements e Lines >= ${THRESHOLD}%.`);
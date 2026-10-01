#!/usr/bin/env node
/**
 * Progress report for the Japanese UI locale: how many keys are really
 * translated, which sections are still untouched, and how many
 * user-facing strings never reach a locale key at all. Read-only and
 * always exits 0; use check:i18n for gating.
 *
 *   node tools/i18n/scan.mjs [--target ja]
 */
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { LANG_DIR, MARK, readJson, flatten, intentionallyIdentical } from './lib.mjs';

const i = process.argv.indexOf('--target');
const target = i === -1 ? 'ja' : process.argv[i + 1];

const base = flatten(readJson(path.join(LANG_DIR, 'en.json')));
const tFile = path.join(LANG_DIR, `${target}.json`);
const tgt = fs.existsSync(tFile) ? flatten(readJson(tFile)) : {};

const sameOnPurpose = intentionallyIdentical(target);

// A value equal to the English one counts as done when the key is on the
// deliberate list: abbreviations, symbols and product names have no other
// Japanese form, so leaving them as-is is the finished state, not a gap.
const translated = (k, v) => {
  const tv = tgt[k];
  if (typeof tv !== 'string' || tv.length === 0 || tv.startsWith(MARK)) return false;
  return tv !== v || k in sameOnPurpose;
};
const pct = (n, total) => (total ? `${Math.round((n / total) * 100)}%` : '—');

const done = Object.entries(base).filter(([k, v]) => translated(k, v)).length;
const total = Object.keys(base).length;

console.log(`=== SRA2 UI localization (${target}) ===\n`);
console.log(`  keys in en.json: ${total}`);
console.log(`  keys in ${target}.json: ${Object.keys(tgt).length}`);
const identical = Object.keys(sameOnPurpose).filter((k) => k in base && tgt[k] === base[k]).length;
console.log(`  translated:      ${done} (${pct(done, total)})`);
console.log(`  placeholder:     ${total - done}`);
if (identical) {
  console.log(`  of which deliberately kept in English: ${identical} (${pct(identical, total)})`);
  console.log(`    (abbreviations, symbols and product names; see tools/i18n/intentionally-identical.json)`);
}

// Per-section progress, so the next batch of work is easy to pick.
const sections = new Map();
for (const [k, v] of Object.entries(base)) {
  const section = k.split('.').slice(0, 2).join('.');
  const s = sections.get(section) ?? { total: 0, done: 0 };
  s.total++;
  if (translated(k, v)) s.done++;
  sections.set(section, s);
}
console.log('\nBy section (untranslated first)');
const rows = [...sections].sort((a, b) => a[1].done / a[1].total - b[1].done / b[1].total || b[1].total - a[1].total);
for (const [name, s] of rows) {
  if (s.done === s.total) continue;
  console.log(`  ${name.padEnd(34)} ${String(s.done).padStart(4)}/${String(s.total).padEnd(4)} ${pct(s.done, s.total)}`);
}
const complete = rows.filter(([, s]) => s.done === s.total).length;
console.log(`  (${complete} section(s) fully translated)`);

console.log('\nHard-coded strings in src/ (never reach a locale key)');
try {
  const out = execFileSync(process.execPath, ['tools/i18n/find-hardcoded.mjs', '--limit', '0'], { encoding: 'utf8' });
  console.log(out.split('\n').filter((l) => /candidates:/.test(l) || /^\s+\d+\s+src\//.test(l)).join('\n'));
  console.log('  (samples: npm run i18n:hardcoded)');
} catch {
  console.log('  (scanner failed)');
}

console.log('\nNext: npm run check:i18n');

#!/usr/bin/env node
/**
 * Flags user-facing strings in src/ that bypass game.i18n, so they can be
 * turned into locale keys. Heuristic by nature: it looks for English-looking
 * literals inside notification/dialog calls and in Handlebars templates,
 * and skips anything already wrapped in a localize/format call.
 *
 *   node tools/i18n/find-hardcoded.mjs [--limit 40]
 */
import fs from 'node:fs';
import path from 'node:path';

const limit = Number(process.argv[process.argv.indexOf('--limit') + 1]) || 40;

const roots = ['src'];
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'packs', '__tests__'].includes(e.name)) continue;
      walk(p);
    } else if (/\.(ts|js|hbs|html)$/.test(e.name) && !/\.(test|spec)\.ts$/.test(e.name)) files.push(p);
  }
})(roots[0]);

// Calls whose first string argument is shown to the user.
const UI_CALL = /\b(ui\.notifications\.(?:info|warn|error)|Dialog\.(?:confirm|prompt)|DialogV2\.(?:confirm|prompt|wait)|console\.warn)\s*\(\s*(['"`])([^'"`]{8,})\2/g;
const HBS_TEXT = />\s*([A-Z][A-Za-z][A-Za-z ,.'()/-]{6,})\s*</g;
// English text sitting in a data table under a displayed field name.
const DATA_FIELD = /\b(name|label|title|description|hint|tooltip)\s*:\s*(['"`])([A-Z][^'"`]{5,})\2/g;
const LOCALIZED = /(localize|format|i18n)/;

const hits = [];
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split('\n');
  const record = (idx, text) => {
    const line = src.slice(0, idx).split('\n').length;
    if (LOCALIZED.test(lines[line - 1] ?? '')) return;
    hits.push({ file, line, text: text.trim().slice(0, 70) });
  };
  for (const m of src.matchAll(UI_CALL)) record(m.index, m[3]);
  if (file.endsWith('.hbs') || file.endsWith('.html')) {
    for (const m of src.matchAll(HBS_TEXT)) record(m.index, m[1]);
  } else {
    for (const m of src.matchAll(DATA_FIELD)) record(m.index, m[3]);
  }
}

const byFile = hits.reduce((acc, h) => ((acc[h.file] = (acc[h.file] ?? 0) + 1), acc), {});
console.log(`=== Hard-coded user-facing strings (heuristic) ===`);
console.log(`  candidates: ${hits.length} across ${Object.keys(byFile).length} files\n`);
for (const [f, n] of Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
  console.log(`  ${n.toString().padStart(4)}  ${f}`);
}
console.log();
for (const h of hits.slice(0, limit)) console.log(`  ${h.file}:${h.line}  ${h.text}`);
if (hits.length > limit) console.log(`  … +${hits.length - limit} more`);

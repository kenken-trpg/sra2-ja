#!/usr/bin/env node
/**
 * Flags user-facing strings in src/ that bypass game.i18n, so they can be
 * turned into locale keys. Heuristic by nature: it looks for English-looking
 * literals inside notification/dialog calls and in Handlebars templates,
 * and skips anything already wrapped in a localize/format call.
 *
 * Three things it deliberately does not count, because each of them buried
 * the real findings under hundreds of entries:
 *
 *   - a value that is itself a locale key. Foundry's DataModel fields take
 *     `label: 'SRA2.FEATS.RATING'` and localize it themselves, so flagging it
 *     is backwards; `item-feat.ts` alone contributed 101 of these;
 *   - the NPC generator's data tables. Their names and descriptions are
 *     content, not UI, and the Japanese ones live in npc-generator-data-ja.ts
 *     and npc-generator-descs-ja.ts rather than in a locale file. That was
 *     1,907 of the 2,125 candidates;
 *   - console.warn. A developer log is not user-facing, and it was the
 *     source of every `Failed to …` line in the report.
 *
 *   node tools/i18n/find-hardcoded.mjs [--limit 40]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { flatten, readJson, LANG_DIR } from './lib.mjs';

const limit = Number(process.argv[process.argv.indexOf('--limit') + 1]) || 40;

/**
 * Data tables whose strings are game content rather than interface text. The
 * Japanese side of these is a separate keyed file, not a locale key, so a hit
 * here is never something to act on.
 */
const CONTENT_TABLES = [
  'module/config/npc-generator-data.ts',
  'module/config/npc-flavor-data.ts',
  'module/config/npc-flavor-data-2.ts',
];

/** Matched on the tail of the path, so the root may be relative or absolute. */
const isContentTable = (file) => {
  const posix = file.split(path.sep).join('/');
  return CONTENT_TABLES.some((t) => posix.endsWith(t));
};

const definedKeys = new Set(
  Object.keys(flatten(readJson(path.join(LANG_DIR, 'en.json')))),
);

/**
 * An identifier rather than display text: a locale key Foundry localizes
 * itself, or a SCREAMING_CASE name used as a key. Real interface text has
 * lowercase letters or spaces in it.
 */
const isIdentifier = (text) =>
  definedKeys.has(text) ||
  /^[A-Z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/.test(text) ||
  /^[A-Z][A-Z0-9_]*$/.test(text);

// Calls whose first string argument is shown to the user.
const UI_CALL = /\b(ui\.notifications\.(?:info|warn|error)|Dialog\.(?:confirm|prompt)|DialogV2\.(?:confirm|prompt|wait))\s*\(\s*(['"`])([^'"`]{8,})\2/g;
const HBS_TEXT = />\s*([A-Z][A-Za-z][A-Za-z ,.'()/-]{6,})\s*</g;
// English text sitting in a data table under a displayed field name.
const DATA_FIELD = /\b(name|label|title|description|hint|tooltip)\s*:\s*(['"`])([A-Z][^'"`]{5,})\2/g;
const LOCALIZED = /(localize|format|i18n)/;

function sourceFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'packs', '__tests__'].includes(e.name)) continue;
      out.push(...sourceFiles(p));
    } else if (/\.(ts|js|hbs|html)$/.test(e.name) && !/\.(test|spec)\.ts$/.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}

/** @returns {{file: string, line: number, text: string}[]} */
export function scan(root = 'src') {
  const hits = [];
  for (const file of sourceFiles(root)) {
    if (isContentTable(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    const lines = src.split('\n');
    const record = (idx, text) => {
      const line = src.slice(0, idx).split('\n').length;
      if (LOCALIZED.test(lines[line - 1] ?? '')) return;
      const clean = text.trim();
      if (isIdentifier(clean)) return;
      hits.push({ file, line, text: clean.slice(0, 70) });
    };
    for (const m of src.matchAll(UI_CALL)) record(m.index, m[3]);
    if (file.endsWith('.hbs') || file.endsWith('.html')) {
      for (const m of src.matchAll(HBS_TEXT)) record(m.index, m[1]);
    } else {
      for (const m of src.matchAll(DATA_FIELD)) record(m.index, m[3]);
    }
  }
  return hits;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const hits = scan();
  const byFile = hits.reduce((acc, h) => ((acc[h.file] = (acc[h.file] ?? 0) + 1), acc), {});
  console.log(`=== Hard-coded user-facing strings (heuristic) ===`);
  console.log(`  candidates: ${hits.length} across ${Object.keys(byFile).length} files\n`);
  for (const [f, n] of Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
    console.log(`  ${n.toString().padStart(4)}  ${f}`);
  }
  console.log();
  for (const h of hits.slice(0, limit)) console.log(`  ${h.file}:${h.line}  ${h.text}`);
  if (hits.length > limit) console.log(`  … +${hits.length - limit} more`);
}

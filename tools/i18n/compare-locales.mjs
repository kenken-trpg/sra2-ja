#!/usr/bin/env node
/**
 * Compares public/lang/<base>.json with public/lang/<target>.json.
 * Reports missing keys, extra keys, still-untranslated values and
 * placeholder/HTML mismatches. Exit code 1 when a hard error is found.
 *
 *   node tools/i18n/compare-locales.mjs [--base en] [--target ja] [--strict]
 */
import path from 'node:path';
import fs from 'node:fs';
import { LANG_DIR, MARK, readJson, flatten, protectedTokens, htmlTags } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? dflt : args[i + 1];
};
const base = opt('base', 'en');
const target = opt('target', 'ja');
const strict = args.includes('--strict');

const baseFile = path.join(LANG_DIR, `${base}.json`);
const targetFile = path.join(LANG_DIR, `${target}.json`);

if (!fs.existsSync(targetFile)) {
  console.error(`✖ ${target}.json not found at ${targetFile}`);
  process.exit(1);
}

const b = flatten(readJson(baseFile));
const t = flatten(readJson(targetFile));

const missing = Object.keys(b).filter((k) => !(k in t));
const extra = Object.keys(t).filter((k) => !(k in b));
const untranslated = [];
const tokenMismatch = [];
const tagMismatch = [];

for (const [k, bv] of Object.entries(b)) {
  if (!(k in t)) continue;
  const tv = t[k];
  if (typeof tv !== 'string') continue;
  if (tv.startsWith(MARK) || tv === bv) untranslated.push(k);
  if (protectedTokens(bv).join('|') !== protectedTokens(tv).join('|')) tokenMismatch.push(k);
  if (htmlTags(bv).join('|') !== htmlTags(tv).join('|')) tagMismatch.push(k);
}

const show = (label, list, limit = 20) => {
  if (!list.length) return;
  console.log(`\n${label}: ${list.length}`);
  for (const k of list.slice(0, limit)) console.log(`  ${k}`);
  if (list.length > limit) console.log(`  … +${list.length - limit} more`);
};

console.log(`=== UI locale ${base} → ${target} ===`);
console.log(`  ${base} keys: ${Object.keys(b).length}`);
console.log(`  ${target} keys: ${Object.keys(t).length}`);
console.log(`  translated:  ${Object.keys(b).length - missing.length - untranslated.length}`);

show('✖ missing keys', missing);
show('✖ extra keys (not in base)', extra);
show('✖ placeholder/UUID mismatch', tokenMismatch);
show('✖ HTML tag mismatch', tagMismatch);
show('· untranslated (placeholder)', untranslated, 10);

const hard = missing.length + extra.length + tokenMismatch.length + tagMismatch.length;
const fail = hard > 0 || (strict && untranslated.length > 0);
console.log(`\n${fail ? '✖ FAIL' : '✔ PASS'}`);
process.exit(fail ? 1 : 0);

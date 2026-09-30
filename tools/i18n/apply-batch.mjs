#!/usr/bin/env node
/**
 * Applies a batch of translations to public/lang/ja.json.
 *
 * The batch is a flat JSON map of dotted locale key to Japanese string:
 *   { "SRA2.SHEET.CHARACTER": "キャラクター" }
 *
 * A key absent from en.json, or a translation that loses a {placeholder},
 * an @UUID[...] reference or an HTML tag, is refused and nothing is
 * written — so a bad batch cannot half-apply.
 *
 *   node tools/i18n/apply-batch.mjs <batch.json> [--target ja]
 */
import path from 'node:path';
import fs from 'node:fs';
import { LANG_DIR, readJson, writeJson, flatten, protectedTokens, htmlTags } from './lib.mjs';

const [batchFile] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const ti = process.argv.indexOf('--target');
const target = ti === -1 ? 'ja' : process.argv[ti + 1];

if (!batchFile) {
  console.error('usage: node tools/i18n/apply-batch.mjs <batch.json> [--target ja]');
  process.exit(2);
}

const base = flatten(readJson(path.join(LANG_DIR, 'en.json')));
const targetFile = path.join(LANG_DIR, `${target}.json`);
const tree = readJson(targetFile);
const batch = readJson(batchFile);

const errors = [];
for (const [key, value] of Object.entries(batch)) {
  if (!(key in base)) {
    errors.push(`${key}: not a key in en.json`);
    continue;
  }
  if (typeof value !== 'string' || !value.length) {
    errors.push(`${key}: translation must be a non-empty string`);
    continue;
  }
  const bv = base[key];
  if (protectedTokens(bv).join('|') !== protectedTokens(value).join('|')) {
    errors.push(`${key}: placeholder/reference mismatch (expected ${protectedTokens(bv).join(' ') || 'none'})`);
  }
  if (htmlTags(bv).join('|') !== htmlTags(value).join('|')) {
    errors.push(`${key}: HTML tags differ from the English string`);
  }
}

if (errors.length) {
  console.error(`✖ ${errors.length} problem(s), nothing written:`);
  for (const e of errors.slice(0, 30)) console.error(`  ${e}`);
  process.exit(1);
}

const setIn = (obj, key, value) => {
  const parts = key.split('.');
  let node = obj;
  for (const p of parts.slice(0, -1)) node = node[p];
  node[parts.at(-1)] = value;
};
for (const [key, value] of Object.entries(batch)) setIn(tree, key, value);

writeJson(targetFile, tree);
console.log(`${target}.json: applied ${Object.keys(batch).length} translation(s) from ${path.basename(batchFile)}`);

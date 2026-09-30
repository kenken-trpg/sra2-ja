#!/usr/bin/env node
/**
 * Creates or refreshes public/lang/ja.json from public/lang/en.json.
 * Existing Japanese strings are kept; keys new upstream arrive as
 * "[JA] <english>" placeholders and keys dropped upstream are removed,
 * so the file never drifts from the reference locale.
 *
 * Scope: UI locale only. Babele compendium translations are a separate
 * task (see docs/localization/translation-rules.md).
 *
 *   node tools/i18n/sync-ja.mjs [--base en] [--target ja] [--dry]
 */
import path from 'node:path';
import fs from 'node:fs';
import { LANG_DIR, MARK, readJson, writeJson } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? dflt : args[i + 1];
};
const base = opt('base', 'en');
const target = opt('target', 'ja');
const dry = args.includes('--dry');

const stats = { added: 0, kept: 0, removed: 0 };
const placeholder = (text) => (text ? `${MARK} ${text}` : text);
const isPlaceholder = (v) => typeof v === 'string' && v.startsWith(MARK);

/** Walk the base tree: keep target values, add placeholders, drop extras. */
function merge(baseNode, targetNode) {
  const out = {};
  for (const [k, bv] of Object.entries(baseNode)) {
    const tv = targetNode?.[k];
    if (bv && typeof bv === 'object' && !Array.isArray(bv)) {
      out[k] = merge(bv, tv && typeof tv === 'object' ? tv : undefined);
    } else if (typeof tv === 'string' && tv.length && !isPlaceholder(tv)) {
      out[k] = tv;
      stats.kept++;
    } else {
      out[k] = placeholder(bv);
      stats.added++;
    }
  }
  for (const k of Object.keys(targetNode ?? {})) if (!(k in baseNode)) stats.removed++;
  return out;
}

const baseUi = readJson(path.join(LANG_DIR, `${base}.json`));
const targetFile = path.join(LANG_DIR, `${target}.json`);
const targetUi = fs.existsSync(targetFile) ? readJson(targetFile) : {};
if (!dry) writeJson(targetFile, merge(baseUi, targetUi));
console.log(
  `${target}.json: +${stats.added} placeholders, ${stats.kept} kept, -${stats.removed} stale` +
    (dry ? ' (dry run — nothing written)' : ''),
);

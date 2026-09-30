#!/usr/bin/env node
/**
 * Builds a Japanese compendium from the English one shipped as JSON source.
 *
 * Scope, and why it is this narrow
 * --------------------------------
 * Only src/packs/anarchy-items-{en} is read: 16 skills, 91 specializations, 5
 * metatypes and 3 folders. Those documents carry no `description` at all, so
 * the only thing translated is a short entry name. No rules prose exists in
 * them to redistribute, which is what keeps this tool inside the fork's
 * licensing stance (see LICENSE.md).
 *
 * The separate public/packs/packs.tgz is deliberately NOT a source. It holds
 * ~200 substantive descriptions of rules content, and translating those into a
 * distributed pack would be the redistribution this project does not do.
 * assertNoProse() below enforces that boundary rather than trusting a comment.
 *
 * Names are resolved from public/lang/{en,ja}.json, so a compendium entry and
 * the interface can never disagree about a term. tools/compendium/names-ja.json
 * covers only what the locale has no string for.
 *
 * The result is written outside the repository tree and is not bundled in the
 * release archive; see README.ja.md for how to install it.
 *
 *   node tools/compendium/generate-ja.mjs [--out <dir>] [--json-only] [--check]
 */
import { compilePack } from '@foundryvtt/foundryvtt-cli';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SOURCE_PACK = path.join(ROOT, 'src', 'packs', 'anarchy-items-en');
const LANG_DIR = path.join(ROOT, 'public', 'lang');
const SUPPLEMENT = path.join(ROOT, 'tools', 'compendium', 'names-ja.json');

/** Git-ignored: the pack is generated locally, never committed or shipped. */
export const DEFAULT_OUT = path.join(ROOT, 'local', 'packs');
export const PACK_NAME = 'anarchy-items-ja';

const flatten = (obj, prefix = '') => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') Object.assign(out, flatten(v, key));
    else out[key] = String(v);
  }
  return out;
};

/**
 * Maps an English string to its Japanese rendering, preferring the interface
 * locale so the two stay consistent. The first locale key wins; later keys
 * with the same English text are duplicates of the same term.
 */
export function buildDictionary() {
  const en = flatten(JSON.parse(fs.readFileSync(path.join(LANG_DIR, 'en.json'), 'utf-8')));
  const ja = flatten(JSON.parse(fs.readFileSync(path.join(LANG_DIR, 'ja.json'), 'utf-8')));

  const dict = new Map();
  const origin = new Map();
  for (const [key, source] of Object.entries(en)) {
    const text = source.trim();
    const target = ja[key];
    // A rendering identical to the English is an untranslated placeholder.
    if (!text || !target || target === source || target.startsWith('[JA] ')) continue;
    if (dict.has(text)) continue;
    dict.set(text, target);
    origin.set(text, `lang:${key}`);
  }

  const { names } = JSON.parse(fs.readFileSync(SUPPLEMENT, 'utf-8'));
  for (const [text, target] of Object.entries(names)) {
    // The locale is authoritative; the supplement only fills gaps.
    if (dict.has(text)) continue;
    dict.set(text, target);
    origin.set(text, 'supplement');
  }
  return { dict, origin };
}

/**
 * Refuses to translate a document carrying prose. This is the licensing
 * boundary in executable form: if a future source pack gains descriptions,
 * this tool stops instead of quietly producing a translated rulebook.
 */
export function assertNoProse(docs) {
  const PROSE_FIELDS = ['description', 'gmnotes', 'bio', 'narrativeEffects'];
  const offenders = [];
  for (const doc of docs) {
    for (const field of PROSE_FIELDS) {
      const value = doc.system?.[field];
      if (typeof value === 'string' && value.trim()) {
        offenders.push(`${doc.name}: system.${field} (${value.trim().length} chars)`);
      }
    }
  }
  if (offenders.length) {
    throw new Error(
      `この Compendium には説明文が含まれています。名称のみを扱う方針のため中止します:\n  ` +
        `${offenders.slice(0, 10).join('\n  ')}` +
        (offenders.length > 10 ? `\n  … 他 ${offenders.length - 10} 件` : ''),
    );
  }
}

/**
 * @returns {{docs: object[], resolved: number, missing: string[], used: Map<string,string>}}
 *   Documents with `name` replaced. Ids, keys, folders and every other field
 *   are carried over untouched.
 */
export function translatePack(sourceDir = SOURCE_PACK) {
  const { dict, origin } = buildDictionary();
  const files = fs.readdirSync(sourceDir).filter((f) => f.endsWith('.json'));
  const docs = files.map((f) => JSON.parse(fs.readFileSync(path.join(sourceDir, f), 'utf-8')));

  assertNoProse(docs);

  const missing = [];
  const used = new Map();
  let resolved = 0;
  for (const doc of docs) {
    const name = (doc.name ?? '').trim();
    if (!name) continue;
    const target = dict.get(name);
    if (!target) {
      missing.push(name);
      continue;
    }
    doc.name = target;
    used.set(name, origin.get(name));
    resolved++;
  }
  return { docs, files, resolved, missing: [...new Set(missing)].sort(), used };
}

async function main() {
  const arg = (name, fallback) => {
    const i = process.argv.indexOf(`--${name}`);
    return i === -1 ? fallback : process.argv[i + 1];
  };
  const outRoot = path.resolve(arg('out', DEFAULT_OUT));
  const jsonDir = path.join(outRoot, `${PACK_NAME}-json`);
  const packDir = path.join(outRoot, PACK_NAME);

  const { docs, files, resolved, missing, used } = translatePack();

  console.log('=== 日本語 Compendium の生成 ===');
  console.log(`  対象: src/packs/anarchy-items-en (${docs.length} 件・説明文 0 件)`);
  console.log(`  訳出: ${resolved} 件`);
  const fromLocale = [...used.values()].filter((o) => o.startsWith('lang:')).length;
  console.log(`    うち UI ロケール由来: ${fromLocale} / 補完ファイル由来: ${used.size - fromLocale}`);

  if (missing.length) {
    console.error(`\n✖ 訳語が見つからない名称が ${missing.length} 件あります。`);
    console.error('  tools/compendium/names-ja.json に追加してください:');
    for (const m of missing) console.error(`    ${JSON.stringify(m)}: ""`);
    process.exitCode = 1;
    return;
  }

  if (process.argv.includes('--check')) {
    console.log('\n✔ PASS (--check: ファイルは書き出していません)');
    return;
  }

  fs.rmSync(jsonDir, { recursive: true, force: true });
  fs.mkdirSync(jsonDir, { recursive: true });
  files.forEach((f, i) => {
    fs.writeFileSync(path.join(jsonDir, f), `${JSON.stringify(docs[i], null, 2)}\n`);
  });
  console.log(`\n  JSON: ${path.relative(ROOT, jsonDir)}`);

  if (process.argv.includes('--json-only')) return;

  fs.rmSync(packDir, { recursive: true, force: true });
  await compilePack(jsonDir, packDir, { yaml: false });
  console.log(`  LevelDB: ${path.relative(ROOT, packDir)}`);

  // system.json is left alone on purpose: the pack is not bundled, so the
  // manifest must not gain an entry pointing at something the archive omits.
  console.log(`
インストール方法:
  1. Foundry を終了する
  2. ${path.relative(ROOT, packDir)} を、インストール先へコピーする
       <Foundry Data>/systems/sra2-ja/packs/${PACK_NAME}/
  3. 同じ <Foundry Data>/systems/sra2-ja/system.json の "packs" に追記する

  {
    "name": "${PACK_NAME}",
    "label": "Anarchy Items (JA)",
    "type": "Item",
    "system": "sra2-ja",
    "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" }
  }

  システムを更新すると systems/sra2-ja/ は置き換えられ、この 2 つの変更は
  失われます。残したい内容はワールド側の Compendium へインポートしてください。`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    console.error(`✖ ${error.message}`);
    process.exit(1);
  });
}

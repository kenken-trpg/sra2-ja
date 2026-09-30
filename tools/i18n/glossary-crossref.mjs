#!/usr/bin/env node
/**
 * Cross-checks this fork's Japanese labels against the SR5 terminology curated
 * in a local chummer-web checkout, and writes a reference table.
 *
 * Why the output is not committed
 * ------------------------------
 * chummer-web's Japanese data is a derivative of chummer5a/chummer5a and is
 * GPL-3.0; this fork is CC BY-SA 4.0 (see LICENSE.md). Redistributing those
 * strings from here would be a licensing question nobody has answered, so the
 * report is written to a git-ignored directory and only this script is
 * tracked. Nothing here writes to public/lang/.
 *
 * What it is for: SRA2 and SR5 share a vocabulary, so a term this fork renders
 * differently from the SR5 glossary is worth a second look. The tool reports
 * where they agree, differ or are missing; deciding what to do with a
 * difference is a human's job, and so is deciding whether a given rendering
 * may be adopted at all.
 *
 *   node tools/i18n/glossary-crossref.mjs [--chummer <path>] [--out <file>]
 *                                         [--summary]
 *
 * The checkout is located from --chummer, then $CHUMMER_WEB, then
 * ../chummer-web.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const LANG_DIR = path.join(ROOT, 'public', 'lang');

/** Where the report goes unless told otherwise; git-ignored. */
export const DEFAULT_OUT = path.join(ROOT, 'docs', 'localization', 'local', 'crossref-sr5.md');

export function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') Object.assign(out, flatten(v, key));
    else out[key] = String(v);
  }
  return out;
}

/**
 * Folds an English label to a lookup key: the glossary lists bare terms, while
 * a label may carry a trailing colon, a wrapping paren or an ampersand.
 */
export function normalize(text) {
  return text
    .trim()
    .replace(/^[([{]|[)\]}]$/g, '')
    .replace(/\s*[:：]\s*$/, '')
    .replace(/\s*&\s*/g, ' and ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** A label worth looking up: a short term, not a sentence or a format string. */
export function isTermLike(text) {
  const t = text.trim();
  if (t.length < 2 || /[{}]/.test(t)) return false;
  if (/[.!?]$/.test(t)) return false;
  return normalize(t).split(' ').length <= 5;
}

/**
 * Reads the chummer-web glossary and overlay. Table 1 of the glossary carries
 * the adopted rendering; table 2 lists terms deliberately kept in the original
 * script, which is a finding in its own right.
 */
export function readChummer(dir) {
  const read = (...p) => {
    const f = path.join(dir, ...p);
    if (!fs.existsSync(f)) throw new Error(`not found in the chummer-web checkout: ${path.join(...p)}`);
    return fs.readFileSync(f, 'utf-8');
  };

  const adopted = new Map();
  const keepAsIs = new Set();
  const md = read('docs', 'translation-glossary.md');
  let table = 0;
  for (const line of md.split('\n')) {
    const heading = /^##\s*表(\d)/.exec(line);
    if (heading) {
      table = Number(heading[1]);
      continue;
    }
    if (!line.startsWith('|') || /^\|\s*-/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells[0] === 'English' || !cells[0]) continue;
    // A cell holding a placeholder is a sentence template, not a term.
    if (table === 1 && cells[1] && !/[{}]/.test(cells[1])) {
      adopted.set(normalize(cells[0]), cells[1]);
    }
    // Table 2 rows whose display equals the English are the untranslated ones.
    if (table === 2 && cells[1] === cells[0]) keepAsIs.add(normalize(cells[0]));
  }

  // data.json is keyed by the English entity name, so it doubles as a glossary.
  // Its sibling ui.json is keyed by Chummer's own UI string ids rather than by
  // English text, so it cannot be matched against a label here; the glossary's
  // table 1 already covers the UI vocabulary.
  const overlay = new Map();
  for (const [en, ja] of Object.entries(
    JSON.parse(read('backend', 'data', 'ja_overrides', 'data.json')),
  )) {
    if (ja.trim()) overlay.set(normalize(en), ja);
  }

  return { adopted, keepAsIs, overlay };
}

/**
 * @returns {{rows: object[], counts: Record<string, number>}}
 *   One row per locale key whose English label matches an SR5 term, tagged
 *   `differs`, `agrees`, `untranslated` (this fork still shows the English) or
 *   `keep-as-is` (SR5 leaves the term in Latin script but this fork did not).
 */
export function crossref(chummerDir) {
  const en = flatten(JSON.parse(fs.readFileSync(path.join(LANG_DIR, 'en.json'), 'utf-8')));
  const ja = flatten(JSON.parse(fs.readFileSync(path.join(LANG_DIR, 'ja.json'), 'utf-8')));
  const { adopted, keepAsIs, overlay } = readChummer(chummerDir);

  const rows = [];
  for (const [key, source] of Object.entries(en)) {
    if (!isTermLike(source)) continue;
    const term = normalize(source);
    const sr5 = adopted.get(term) ?? overlay.get(term);
    const origin = adopted.has(term) ? 'glossary' : overlay.has(term) ? 'overlay' : null;
    const mine = ja[key];
    if (mine === undefined) continue;
    // `[JA] …` marks a key deliberately left untranslated pending a scope
    // decision, not a rendering to compare.
    if (mine.startsWith(HELD_BACK)) continue;

    let tag;
    if (keepAsIs.has(term) && !sr5) {
      // Only interesting if this fork did translate it.
      if (mine === source) continue;
      tag = 'keep-as-is';
    } else if (!sr5) {
      continue;
    } else if (mine === source) {
      tag = 'untranslated';
    } else {
      // A label keeps its trailing colon while the glossary lists the bare
      // term; that is punctuation, not a terminology difference.
      const bare = mine.replace(/\s*[:：]\s*$/, '');
      tag = bare === sr5 ? 'agrees' : 'differs';
    }
    rows.push({ key, source, mine, sr5: sr5 ?? source, origin: origin ?? 'glossary-table2', tag });
  }

  rows.sort((a, b) => a.source.localeCompare(b.source) || a.key.localeCompare(b.key));
  const counts = {};
  for (const r of rows) counts[r.tag] = (counts[r.tag] ?? 0) + 1;
  return { rows, counts };
}

/** Prefix marking a key held back from translation on purpose. */
const HELD_BACK = '[JA] ';

const TAGS = [
  ['differs', '相違 — SR5 用語集と訳が違う。どちらを採るかは人が決める'],
  ['untranslated', '未訳 — 本フォークは英語のまま。SR5 側に訳がある'],
  ['keep-as-is', '原文維持 — SR5 ではラテン文字のまま。本フォークは訳している'],
  ['agrees', '一致 — 確認済みとして扱える'],
];

export function render(rows, chummerDir) {
  const out = [
    '# SR5 用語クロスリファレンス（ローカル専用・Git 管理外）',
    '',
    '`npm run check:glossary` の生成物。**手で編集しない / コミットしない。**',
    '',
    `参照元: \`${chummerDir}\``,
    '',
    'chummer-web の日本語データは chummer5a (GPL-3.0) の派生物で、本フォークは',
    'CC BY-SA 4.0。**ここに出た訳語をそのまま `public/lang/ja.json` に写すことは',
    'ライセンス上の判断を必要とする**ので、突き合わせの材料として読むこと。',
    '',
  ];
  for (const [tag, caption] of TAGS) {
    const list = rows.filter((r) => r.tag === tag);
    out.push(`## ${caption} (${list.length})`, '');
    if (!list.length) {
      out.push('なし', '');
      continue;
    }
    // The same term recurs across many keys; show each rendering once and
    // name the keys, so the table reads as a decision list.
    const grouped = new Map();
    for (const r of list) {
      const id = `${r.source}\u0000${r.mine}\u0000${r.sr5}`;
      const g = grouped.get(id);
      if (g) g.keys.push(r.key);
      else grouped.set(id, { ...r, keys: [r.key] });
    }
    out.push('| English | sra2-ja | SR5 | 出典 | 箇所 | キー |', '|---|---|---|---|---|---|');
    for (const g of grouped.values()) {
      const keys = g.keys.map((k) => `\`${k}\``).join('<br>');
      out.push(`| ${g.source} | ${g.mine} | ${g.sr5} | ${g.origin} | ${g.keys.length} | ${keys} |`);
    }
    out.push('');
  }
  return out.join('\n');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (name, fallback) => {
    const i = process.argv.indexOf(`--${name}`);
    return i === -1 ? fallback : process.argv[i + 1];
  };
  const chummerDir = path.resolve(
    arg('chummer', process.env.CHUMMER_WEB ?? path.join(ROOT, '..', 'chummer-web')),
  );
  if (!fs.existsSync(chummerDir)) {
    console.error(`chummer-web の checkout が見つかりません: ${chummerDir}`);
    console.error('--chummer <path> か環境変数 CHUMMER_WEB で指定してください。');
    process.exit(2);
  }

  const { rows, counts } = crossref(chummerDir);
  console.log(`=== SR5 用語クロスリファレンス ===`);
  console.log(`  参照元: ${chummerDir}`);
  for (const [tag, caption] of TAGS) console.log(`  ${caption.split(' —')[0]}: ${counts[tag] ?? 0}`);

  if (!process.argv.includes('--summary')) {
    const out = path.resolve(arg('out', DEFAULT_OUT));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, render(rows, chummerDir));
    console.log(`\n  → ${path.relative(ROOT, out)} (Git 管理外)`);
  }
}

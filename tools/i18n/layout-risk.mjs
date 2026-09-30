#!/usr/bin/env node
/**
 * Estimates where a Japanese label will not fit the layout the English one
 * was built for, without starting Foundry.
 *
 * jsdom does no layout, so nothing here measures a real glyph. Instead it
 * pairs two static facts:
 *
 *   - the built CSS: which classes carry a fixed px width, a max-width or
 *     `white-space: nowrap`, and at what font-size;
 *   - the templates: which locale key is rendered inside which element.
 *
 * Width comes from a character-class model (a CJK glyph occupies one em, a
 * Latin one about half), so absolute numbers are rough. The findings are
 * therefore stated as a comparison between en and ja rather than as an
 * absolute measurement: a box that fits the English label but not the
 * Japanese one is a localization regression, whereas a box too small for
 * both is upstream tightness this fork did not introduce.
 *
 *   node tools/i18n/layout-risk.mjs [--target ja] [--limit 25]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CSS_FILE = path.join(ROOT, 'public', 'style', 'sra2.css');
const TEMPLATE_DIR = path.join(ROOT, 'public', 'templates');
const LANG_DIR = path.join(ROOT, 'public', 'lang');

/**
 * Foundry's sheet body font-size, used when no ancestor declares one. The
 * absolute value only shifts every estimate by the same factor, so it does
 * not change which labels are flagged relative to English.
 */
export const DEFAULT_FONT_SIZE = 13;

/** A select renders an arrow that eats into its declared width. */
const SELECT_ARROW = 18;

const VOID_TAGS = new Set([
  'br', 'hr', 'img', 'input', 'meta', 'link', 'source',
  'area', 'base', 'col', 'embed', 'track', 'wbr',
]);

/** Ranges where a glyph is full-width, i.e. one em rather than about half. */
const isWide = (cp) =>
  (cp >= 0x1100 && cp <= 0x115f) ||
  (cp >= 0x2e80 && cp <= 0xa4cf) ||
  (cp >= 0xac00 && cp <= 0xd7a3) ||
  (cp >= 0xf900 && cp <= 0xfaff) ||
  (cp >= 0xfe30 && cp <= 0xfe6f) ||
  (cp >= 0xff00 && cp <= 0xff60) ||
  (cp >= 0xffe0 && cp <= 0xffe6);

/** Rough rendered width in px of `text` at `fontSize`. */
export function textWidth(text, fontSize) {
  let w = 0;
  for (const ch of text) w += isWide(ch.codePointAt(0)) ? fontSize : fontSize * 0.5;
  return w;
}

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
 * Indexes the built CSS by class, keeping only declarations whose *subject*
 * is that class. `.menu-item i { width: 16px }` sizes the icon, not the menu
 * item, so the last compound selector decides which class a width belongs
 * to; a rule whose subject is a bare tag cannot be tied to a template class
 * and is skipped.
 */
export function indexCss(css) {
  const index = new Map();
  const put = (cls, extra) => index.set(cls, { ...(index.get(cls) ?? {}), ...extra });

  for (const [, selector, decls] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const width = /(?:^|;|\s)width\s*:\s*(\d+(?:\.\d+)?)px/.exec(decls);
    const maxWidth = /max-width\s*:\s*(\d+(?:\.\d+)?)px/.exec(decls);
    const nowrap = /white-space\s*:\s*nowrap/.test(decls);
    const fontSize = /font-size\s*:\s*(\d+(?:\.\d+)?)(px|rem|em)/.exec(decls);
    const padding = /padding(?:-(?:left|right))?\s*:\s*(\d+(?:\.\d+)?)px/.exec(decls);
    if (!width && !maxWidth && !nowrap && !fontSize) continue;

    for (const one of selector.split(',')) {
      const subject = one.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean).pop();
      if (!subject) continue;
      const classes = [...subject.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1]);
      if (!classes.length) continue;
      const cls = classes[classes.length - 1];
      if (width) put(cls, { width: Number(width[1]) });
      if (maxWidth) put(cls, { maxWidth: Number(maxWidth[1]) });
      if (nowrap) put(cls, { nowrap: true });
      if (padding) put(cls, { padding: Number(padding[1]) });
      if (fontSize) {
        put(cls, { fontSize: Number(fontSize[1]) * (fontSize[2] === 'px' ? 1 : 16) });
      }
    }
  }
  return index;
}

/**
 * Walks a template, tracking the open element stack, and yields one entry per
 * `{{localize "KEY"}}` with the constraints inherited from its ancestors.
 */
export function collectSites(template, file, cssIndex) {
  const sites = [];
  const stack = [];
  const token =
    /<\/?([A-Za-z][\w-]*)((?:"[^"]*"|'[^']*'|[^>])*)>|\{\{localize\s+["']([^"']+)["']\}\}/g;

  for (let m; (m = token.exec(template)); ) {
    if (m[3]) {
      let box = null;
      let nowrap = false;
      let fontSize = null;
      for (let i = stack.length - 1; i >= 0; i--) {
        for (const cls of stack[i]) {
          const d = cssIndex.get(cls);
          if (!d) continue;
          if (!box && (d.width || d.maxWidth)) {
            box = {
              cls,
              px: d.width ?? d.maxWidth,
              padding: d.padding ?? 0,
              tag: stack[i].tag,
            };
          }
          if (d.nowrap) nowrap = true;
          if (fontSize === null && d.fontSize) fontSize = d.fontSize;
        }
      }
      sites.push({ key: m[3], file, box, nowrap, fontSize: fontSize ?? DEFAULT_FONT_SIZE });
      continue;
    }

    const tag = m[1].toLowerCase();
    if (m[0][1] === '/') {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) {
          stack.length = i;
          break;
        }
      }
    } else if (!VOID_TAGS.has(tag) && !/\/>$/.test(m[0])) {
      const classes = (/class="([^"]*)"/.exec(m[2]) ?? [, ''])[1].split(/\s+/).filter(Boolean);
      classes.tag = tag;
      stack.push(classes);
    }
  }
  return sites;
}

/**
 * @returns {{
 *   sites: number, constrained: number,
 *   regressions: object[], preexisting: object[], nowrapGrowth: object[],
 * }}
 *   `regressions` are boxes the English label fits and the target one does
 *   not. `preexisting` are boxes neither fits. `nowrapGrowth` ranks labels
 *   that cannot wrap by how much wider the target makes them; those sit in
 *   flex rows whose width no static pass can know, so they are a
 *   manual-check list, not a verdict.
 */
export function analyze(target = 'ja') {
  const cssIndex = indexCss(fs.readFileSync(CSS_FILE, 'utf-8'));
  const base = flatten(JSON.parse(fs.readFileSync(path.join(LANG_DIR, 'en.json'), 'utf-8')));
  const tgt = flatten(JSON.parse(fs.readFileSync(path.join(LANG_DIR, `${target}.json`), 'utf-8')));

  const sites = [];
  for (const file of fs.readdirSync(TEMPLATE_DIR).filter((f) => f.endsWith('.hbs'))) {
    sites.push(
      ...collectSites(fs.readFileSync(path.join(TEMPLATE_DIR, file), 'utf-8'), file, cssIndex),
    );
  }

  const regressions = [];
  const preexisting = [];
  const nowrapGrowth = [];
  let constrained = 0;

  for (const site of sites) {
    const en = base[site.key];
    const ja = tgt[site.key];
    if (!en || !ja || en === ja) continue;
    const enW = textWidth(en, site.fontSize);
    const jaW = textWidth(ja, site.fontSize);

    if (site.nowrap) {
      nowrapGrowth.push({ ...site, en, ja, enW, jaW, growth: jaW / enW });
    }
    if (!site.box) continue;
    constrained++;
    const avail =
      site.box.px - 2 * site.box.padding - (site.box.tag === 'select' ? SELECT_ARROW : 0);
    if (jaW <= avail) continue;
    (enW <= avail ? regressions : preexisting).push({ ...site, en, ja, enW, jaW, avail });
  }

  // The same key often appears several times in one template; rank each once.
  const seen = new Set();
  const uniqueGrowth = nowrapGrowth.filter((f) => {
    const id = `${f.file}\u0000${f.key}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  uniqueGrowth.sort((a, b) => b.growth - a.growth || b.jaW - a.jaW);
  return { sites: sites.length, constrained, regressions, preexisting, nowrapGrowth: uniqueGrowth };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (name, fallback) => {
    const i = process.argv.indexOf(`--${name}`);
    return i === -1 ? fallback : process.argv[i + 1];
  };
  const target = arg('target', 'ja');
  const limit = Number(arg('limit', 25));
  const r = analyze(target);

  console.log(`=== layout risk ${target} ===`);
  console.log(`  localize sites in templates: ${r.sites}`);
  console.log(`  inside a fixed px width:     ${r.constrained}`);
  console.log(`  cannot wrap:                 ${r.nowrapGrowth.length}`);

  const show = (label, list) => {
    console.log(`\n${label}: ${list.length}`);
    for (const f of list.slice(0, limit)) {
      console.log(
        `  ${f.file} .${f.box.cls} ${f.box.px}px` +
          ` (usable ${f.avail.toFixed(0)}) en≈${f.enW.toFixed(0)} ${target}≈${f.jaW.toFixed(0)}` +
          `\n      ${f.key} "${f.ja}"`,
      );
    }
  };
  show(`✖ ${target} overflows a box English fits`, r.regressions);
  show('· too narrow for both (upstream)', r.preexisting);

  console.log(`\n· widest growth among labels that cannot wrap (check these in Foundry first)`);
  for (const f of r.nowrapGrowth.slice(0, limit)) {
    console.log(
      `  ×${f.growth.toFixed(2)} en≈${f.enW.toFixed(0)} ${target}≈${f.jaW.toFixed(0)}` +
        ` ${f.file}  ${f.key} "${f.ja}"`,
    );
  }

  console.log(`\n${r.regressions.length ? '✖ FAIL' : '✔ PASS'}`);
  process.exitCode = r.regressions.length ? 1 : 0;
}

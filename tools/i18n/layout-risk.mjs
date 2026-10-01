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
 * Indexes the built CSS by the last class of each selector's *subject*.
 * `.menu-item i { width: 16px }` sizes the icon, not the menu item, so the
 * subject compound decides which class a width belongs to; a rule whose
 * subject is a bare tag cannot be tied to a template class and is skipped.
 *
 * The rest of the selector is kept, not discarded. A rule written
 * `.sheet-v2 .dice .attribute-input { width: 40px }` says nothing about an
 * `.attribute-input` elsewhere, and treating it as if it did invents
 * findings in templates the rule cannot reach. So each entry records the
 * other classes required on the subject element (`also`) and the classes
 * required on its ancestors, in order (`ancestors`); `matchRule` below holds
 * a candidate to them.
 *
 * @returns {Map<string, object[]>} class → candidate rules, in source order.
 */
export function indexCss(css) {
  const index = new Map();

  for (const [, selector, decls] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const width = /(?:^|;|\s)width\s*:\s*(\d+(?:\.\d+)?)px/.exec(decls);
    const maxWidth = /max-width\s*:\s*(\d+(?:\.\d+)?)px/.exec(decls);
    const nowrap = /white-space\s*:\s*nowrap/.test(decls);
    const fontSize = /font-size\s*:\s*(\d+(?:\.\d+)?)(px|rem|em)/.exec(decls);
    const padding = /padding(?:-(?:left|right))?\s*:\s*(\d+(?:\.\d+)?)px/.exec(decls);
    if (!width && !maxWidth && !nowrap && !fontSize) continue;

    for (const one of selector.split(',')) {
      const compounds = one.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean);
      const subject = compounds.pop();
      if (!subject) continue;
      const classes = [...subject.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1]);
      if (!classes.length) continue;
      const cls = classes[classes.length - 1];

      // A `:hover` or `::before` rule describes a state or a generated box,
      // not the element a label sits in.
      if (/::?[a-z-]+(\(|$|\.|\s)/.test(subject.replace(/^[^:]*/, ''))) continue;

      const rule = {
        also: classes.slice(0, -1),
        ancestors: compounds
          .map((c) => [...c.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((m) => m[1]))
          .filter((cs) => cs.length)
          .map((cs) => cs[cs.length - 1]),
      };
      if (width) rule.width = Number(width[1]);
      if (maxWidth) rule.maxWidth = Number(maxWidth[1]);
      if (nowrap) rule.nowrap = true;
      if (padding) rule.padding = Number(padding[1]);
      if (fontSize) rule.fontSize = Number(fontSize[1]) * (fontSize[2] === 'px' ? 1 : 16);

      if (!index.has(cls)) index.set(cls, []);
      index.get(cls).push(rule);
    }
  }
  return index;
}

/**
 * Whether `rule` can apply to `stack[i]`: every other class of its subject
 * compound is on that element, and its ancestor classes appear below it in
 * the stack, in order. Descendant combinators only; `>` and `+` were
 * flattened by indexCss, which makes a match slightly too permissive rather
 * than too strict.
 *
 * `outside` holds class names that no template contains, so they are put on
 * by Foundry around the template — a Dialog's `.sra2.roll-dialog` wrapper,
 * for instance. Requiring those would throw away rules that do apply at
 * runtime, so they are not required; a class a template does use is.
 */
export function matchRule(rule, stack, i, outside = new Set()) {
  for (const c of rule.also) if (!stack[i].includes(c)) return false;
  let at = 0;
  for (const want of rule.ancestors) {
    if (outside.has(want)) continue;
    while (at < i && !stack[at].includes(want)) at++;
    if (at >= i) return false;
    at++;
  }
  return true;
}

/** Every class name that appears in a template, i.e. one we can check for. */
export function templateClasses(dir = TEMPLATE_DIR) {
  const out = new Set();
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.hbs'))) {
    const text = fs.readFileSync(path.join(dir, file), 'utf-8');
    for (const m of text.matchAll(/class="([^"]*)"/g)) {
      for (const c of m[1].split(/\s+/)) {
        if (/^[A-Za-z][\w-]*$/.test(c)) out.add(c);
      }
    }
  }
  return out;
}

/**
 * The declarations in effect on `stack[i]`, merged in source order so a later
 * rule wins, as the cascade does for selectors of equal specificity.
 */
export function declsFor(cssIndex, stack, i, outside) {
  let out = null;
  for (const cls of stack[i]) {
    for (const rule of cssIndex.get(cls) ?? []) {
      if (!matchRule(rule, stack, i, outside)) continue;
      out = { ...(out ?? {}), ...rule, cls };
    }
  }
  return out;
}

/**
 * Walks a template, tracking the open element stack, and yields one entry per
 * `{{localize "KEY"}}` with the constraints inherited from its ancestors.
 */
export function collectSites(template, file, cssIndex, outside) {
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
        const d = declsFor(cssIndex, stack, i, outside);
        if (!d) continue;
        if (!box && (d.width || d.maxWidth)) {
          box = {
            cls: d.cls,
            px: d.width ?? d.maxWidth,
            padding: d.padding ?? 0,
            tag: stack[i].tag,
          };
        }
        if (d.nowrap) nowrap = true;
        if (fontSize === null && d.fontSize) fontSize = d.fontSize;
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

  const inTemplates = templateClasses();
  const outside = new Set();
  for (const rules of cssIndex.values()) {
    for (const rule of rules) {
      for (const c of rule.ancestors) if (!inTemplates.has(c)) outside.add(c);
    }
  }

  const sites = [];
  for (const file of fs.readdirSync(TEMPLATE_DIR).filter((f) => f.endsWith('.hbs'))) {
    sites.push(
      ...collectSites(
        fs.readFileSync(path.join(TEMPLATE_DIR, file), 'utf-8'),
        file,
        cssIndex,
        outside,
      ),
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

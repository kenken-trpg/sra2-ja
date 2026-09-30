import fs from 'node:fs';
import path from 'node:path';

export const LANG_DIR = path.resolve('public/lang');
export const MARK = '[JA]';

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Written with the 4-space indentation en.json already uses. */
export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 4) + '\n', 'utf8');
}

/** Flatten a nested locale object into { "A.B.C": "value" }. */
export function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

/** Foundry-specific substrings that must survive translation verbatim. */
export const PROTECTED_PATTERNS = [
  /\{[^{}]+\}/g,           // {name}, {count}
  /@UUID\[[^\]]*\]/g,      // @UUID[...]
  /@Compendium\[[^\]]*\]/g,
  /\[\[[^\]]*\]\]/g,       // inline rolls
];

export function protectedTokens(str) {
  if (typeof str !== 'string') return [];
  const found = [];
  for (const re of PROTECTED_PATTERNS) found.push(...(str.match(re) ?? []));
  return found.sort();
}

export function htmlTags(str) {
  if (typeof str !== 'string') return [];
  return (str.match(/<\/?[a-zA-Z][^>]*>/g) ?? [])
    .map((t) => t.toLowerCase().replace(/\s+[^>]*(?=>)/, ''))
    .sort();
}


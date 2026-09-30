/**
 * Every `SRA2.*` locale key referenced from src/ must exist in every shipped
 * locale. Foundry returns the key itself when it is undefined, so a missing
 * key is not an error at runtime: it silently renders as `SRA2.FOO.BAR` in
 * the UI. This test catches that without starting Foundry.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../../..');
const SRC = path.join(ROOT, 'src');
const LANG_DIR = path.join(ROOT, 'public', 'lang');
const LOCALES = ['en', 'fr', 'ja'] as const;

/**
 * Keys referenced by upstream code that no locale defines. Each one renders
 * as a raw key today; they are listed here so this test guards against *new*
 * gaps instead of failing on inherited ones. Removing an entry from this list
 * is the way to close it.
 */
const KNOWN_UNDEFINED = new Set([
  'SRA2.FEATS.FIRST_FEAT_TRANSFERRED',
  'SRA2.ROLL_DIALOG.NO_SKILL_SELECTED',
  'SRA2.ICE.CANNOT_ATTACK',
  'SRA2.FEATS.VEHICLE_CREATION_ERROR',
  'SRA2.ICE.SERVER_INDEX',
  'SRA2.FEATS.RR_LIST',
  'SRA2.FEATS.WEAPON.RANGE_DICE',
  'SRA2.SKILLS.SLUG',
  'SRA2.SPECIALIZATIONS.SLUG',
]);

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'packs', '__tests__'].includes(entry.name)) continue;
      out.push(...sourceFiles(p));
    } else if (/\.(ts|hbs|html)$/.test(entry.name) && !/\.(test|spec)\.ts$/.test(entry.name)) {
      out.push(p);
    }
  }
  return out;
}

function flatten(obj: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') Object.assign(out, flatten(v, key));
    else out[key] = String(v);
  }
  return out;
}

const locales = Object.fromEntries(
  LOCALES.map((lang) => [lang, flatten(JSON.parse(fs.readFileSync(path.join(LANG_DIR, `${lang}.json`), 'utf-8')))]),
) as Record<(typeof LOCALES)[number], Record<string, string>>;

/** Literal `SRA2.*` references, mapped to the file they were found in. */
const referenced = new Map<string, string>();
for (const file of sourceFiles(SRC)) {
  const text = fs.readFileSync(file, 'utf-8');
  for (const m of text.matchAll(/["'`](SRA2\.[A-Za-z0-9_.]*)["'`]/g)) {
    if (!referenced.has(m[1])) referenced.set(m[1], path.relative(ROOT, file));
  }
}

describe('locale key references', () => {
  it('finds locale key references to check', () => {
    expect(referenced.size).toBeGreaterThan(300);
  });

  describe.each(LOCALES)('%s.json', (lang) => {
    const defined = locales[lang];
    const keys = Object.keys(defined);

    it('defines every key referenced from src/', () => {
      const missing: string[] = [];
      for (const [key, file] of referenced) {
        if (KNOWN_UNDEFINED.has(key)) continue;
        if (key in defined) continue;
        // A trailing-dot literal is a namespace built up at runtime; require
        // that at least one key lives under it.
        const prefix = key.endsWith('.') ? key : `${key}.`;
        if (keys.some((k) => k.startsWith(prefix))) continue;
        missing.push(`${key} (${file})`);
      }
      expect(missing).toEqual([]);
    });

    it('has no empty value for a referenced key', () => {
      const empty = [...referenced.keys()].filter((k) => k in defined && defined[k].trim() === '');
      expect(empty).toEqual([]);
    });
  });

  it('keeps the known-undefined list accurate', () => {
    // If a key here gets defined, or stops being referenced, the list is stale.
    const stale = [...KNOWN_UNDEFINED].filter(
      (k) => !referenced.has(k) || LOCALES.some((lang) => k in locales[lang]),
    );
    expect(stale).toEqual([]);
  });
});

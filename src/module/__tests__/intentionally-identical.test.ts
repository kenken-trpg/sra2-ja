/**
 * Covers tools/i18n/intentionally-identical.json: the list that lets the
 * progress report call a key done even though its Japanese value equals the
 * English one.
 *
 * The list exists to make the report honest, so it has to stay honest itself.
 * An entry that no longer matches reality would hide a real gap, and nothing
 * but these checks would notice.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../../..');

const readJson = (p: string) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

function flatten(obj: Record<string, unknown>, prefix = '', out: Record<string, string> = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v as Record<string, unknown>, key, out);
    else out[key] = v as string;
  }
  return out;
}

const list = readJson('tools/i18n/intentionally-identical.json') as {
  keys: Record<string, string>;
};
const en = flatten(readJson('public/lang/en.json'));
const ja = flatten(readJson('public/lang/ja.json'));
const entries = Object.entries(list.keys);

describe('intentionally-identical allowlist', () => {
  it('is not empty and carries a reason for every key', () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const [key, reason] of entries) {
      expect(typeof reason, key).toBe('string');
      expect(reason.length, key).toBeGreaterThan(5);
    }
  });

  it('only lists keys that exist in en.json', () => {
    const unknown = entries.map(([k]) => k).filter((k) => !(k in en));
    expect(unknown).toEqual([]);
  });

  it('only lists keys whose Japanese value is still identical', () => {
    const diverged = entries.map(([k]) => k).filter((k) => ja[k] !== en[k]);
    expect(diverged).toEqual([]);
  });

  it('accounts for every identical value in ja.json', () => {
    const unlisted = Object.keys(en).filter((k) => ja[k] === en[k] && !(k in list.keys));
    expect(unlisted).toEqual([]);
  });
});

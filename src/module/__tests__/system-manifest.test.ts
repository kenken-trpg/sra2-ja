/**
 * Checks public/system.json against the code and the files on disk. Most of
 * what makes Foundry refuse to load a system, or show a missing language /
 * broken asset, is visible here without starting Foundry.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { SYSTEM } from '../config/system.js';

const ROOT = path.resolve(__dirname, '../../..');
const PUBLIC = path.join(ROOT, 'public');
const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'system.json'), 'utf-8'));

const publicPath = (url: string): string =>
  path.join(PUBLIC, url.replace(/^\/?systems\/sra2-ja\//, ''));

describe('system.json', () => {
  it('uses the fork id, matching config/system.ts', () => {
    expect(manifest.id).toBe('sra2-ja');
    expect(SYSTEM.id).toBe(manifest.id);
  });

  it('keeps the manifest and download URLs on the fork repository', () => {
    expect(manifest.manifest).toContain('kenken-trpg/sra2-ja');
    expect(manifest.url).toContain('kenken-trpg/sra2-ja');
    expect(manifest.download).toContain('kenken-trpg/sra2-ja');
  });

  it('points download at the tag matching its own version', () => {
    expect(manifest.download).toContain(`/v${manifest.version}/`);
    expect(manifest.download).toContain(`foundry-sra2-ja-v${manifest.version}.zip`);
  });

  it('declares v14 compatibility', () => {
    expect(manifest.compatibility.minimum).toBe(14);
    expect(manifest.compatibility.verified).toBeGreaterThanOrEqual(14);
  });

  it('ships every declared esmodule and stylesheet', () => {
    for (const p of [...manifest.esmodules, ...manifest.styles]) {
      expect(fs.existsSync(path.join(PUBLIC, p)), p).toBe(true);
    }
  });

  describe('languages', () => {
    it('declares en, fr and ja', () => {
      expect(manifest.languages.map((l: { lang: string }) => l.lang).sort()).toEqual(['en', 'fr', 'ja']);
    });

    it('names Japanese so it is selectable in the Foundry language list', () => {
      const ja = manifest.languages.find((l: { lang: string }) => l.lang === 'ja');
      expect(ja.name).toBe('日本語');
    });

    it.each(['en', 'fr', 'ja'])('ships %s at its declared path as valid JSON', (lang) => {
      const entry = manifest.languages.find((l: { lang: string }) => l.lang === lang);
      const file = path.join(PUBLIC, entry.path);
      expect(fs.existsSync(file), entry.path).toBe(true);
      const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
      expect(Object.keys(parsed.SRA2 ?? {}).length).toBeGreaterThan(0);
    });
  });

  describe('packs', () => {
    it('gives every pack a unique name', () => {
      const names = manifest.packs.map((p: { name: string }) => p.name);
      expect(new Set(names).size).toBe(names.length);
    });

    it('binds every pack to this system id', () => {
      for (const p of manifest.packs) expect(p.system, p.name).toBe(manifest.id);
    });

    it('declares only Item packs, matching the documentTypes', () => {
      for (const p of manifest.packs) expect(Object.keys(manifest.documentTypes)).toContain(p.type);
    });
  });

  it('references media that is actually shipped', () => {
    const missing = (manifest.media ?? [])
      .map((m: { url: string }) => m.url)
      .filter((url: string) => !fs.existsSync(publicPath(url)));
    expect(missing).toEqual([]);
  });


  it('declares the primary token attribute used by the actor data model', () => {
    expect(manifest.primaryTokenAttribute).toBe('state.health');
  });
});

describe('shipped stylesheet assets', () => {
  const css = fs.readFileSync(path.join(PUBLIC, 'style', 'sra2.css'), 'utf-8');
  const refs = [...css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)]
    .map((m) => m[1])
    .filter((r) => !/^(data:|https?:)/.test(r));

  it('finds asset references to check', () => {
    expect(refs.length).toBeGreaterThan(0);
  });

  it('resolves every font and image reference inside the shipped package', () => {
    const missing = refs.filter((r) => !fs.existsSync(publicPath(r)));
    expect(missing).toEqual([]);
  });

});

/**
 * Covers tools/compendium/generate-ja.mjs: that every entry name resolves, that
 * names come from the interface locale wherever it has one, and that the tool
 * refuses to translate a document carrying prose.
 *
 * The prose guard is the licensing boundary in executable form — the fork
 * translates entry names, not rules text — so it is tested, not assumed.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(__dirname, '../../..');

interface Tool {
  buildDictionary(): { dict: Map<string, string>; origin: Map<string, string> };
  assertNoProse(docs: unknown[]): void;
  translatePack(dir?: string): {
    docs: { _id: string; name: string }[];
    resolved: number;
    missing: string[];
    used: Map<string, string>;
  };
}

let tool: Tool;

beforeAll(async () => {
  // A computed specifier: the tool is plain .mjs with no type declarations.
  const url = pathToFileURL(path.join(ROOT, 'tools/compendium/generate-ja.mjs')).href;
  tool = (await import(/* @vite-ignore */ url)) as Tool;
});

describe('Japanese compendium generation', () => {
  it('translates every name in the English source pack', () => {
    const { resolved, missing, docs } = tool.translatePack();
    expect(missing).toEqual([]);
    expect(resolved).toBe(docs.length);
  });

  it('takes most names from the interface locale, not the supplement', () => {
    const { used } = tool.translatePack();
    const fromLocale = [...used.values()].filter((o) => o.startsWith('lang:')).length;
    // The locale must stay the primary source, or the compendium and the UI
    // can drift apart.
    expect(fromLocale).toBeGreaterThan(used.size / 2);
  });

  it('changes nothing but the name', () => {
    const source = path.join(ROOT, 'src/packs/anarchy-items-en');
    const original = new Map(
      fs
        .readdirSync(source)
        .filter((f) => f.endsWith('.json'))
        .map((f) => {
          const doc = JSON.parse(fs.readFileSync(path.join(source, f), 'utf-8'));
          return [doc._id as string, doc as Record<string, unknown>];
        }),
    );

    const changed: string[] = [];
    for (const doc of tool.translatePack().docs) {
      const before = original.get(doc._id);
      expect(before, doc._id).toBeDefined();
      for (const key of Object.keys(before as Record<string, unknown>)) {
        if (key === 'name') continue;
        const a = JSON.stringify((before as Record<string, unknown>)[key]);
        const b = JSON.stringify((doc as unknown as Record<string, unknown>)[key]);
        if (a !== b) changed.push(`${doc._id}.${key}`);
      }
    }
    // Ids in particular must survive, or a character's items lose their links.
    expect(changed).toEqual([]);
  });

  it('gives every entry a Japanese name', () => {
    const untranslated = tool
      .translatePack()
      .docs.filter((d) => !/[぀-ヿ一-龯]/.test(d.name))
      .map((d) => d.name);
    expect(untranslated).toEqual([]);
  });

  describe('the prose guard', () => {
    it('accepts documents that carry no prose', () => {
      expect(() => tool.assertNoProse([{ name: 'Stealth', system: { description: '' } }])).not.toThrow();
    });

    it.each(['description', 'gmnotes', 'bio', 'narrativeEffects'])(
      'refuses a document carrying system.%s',
      (field) => {
        const doc = { name: 'Gremlins', system: { [field]: '<p>Some rules prose.</p>' } };
        expect(() => tool.assertNoProse([doc])).toThrow(/説明文/);
      },
    );

    it('names the offending entry so the source can be found', () => {
      const doc = { name: 'Gremlins', system: { description: '<p>x</p>' } };
      expect(() => tool.assertNoProse([doc])).toThrow(/Gremlins/);
    });
  });
});

/**
 * Covers src/module/config/npc-generator-flavor-ja.ts: the Japanese text for
 * the NPC generator's keyword, behavior and catchphrase tables.
 *
 * The maps are keyed by the upstream English string because the entries have
 * no id. That is fragile in one specific way: if upstream rewords an entry,
 * the key stops matching and the text silently reverts to English. Nothing in
 * the running system would report that, so it is a test.
 */
import { describe, it, expect } from 'vitest';
import {
  KEYWORDS_JA,
  BEHAVIORS_JA,
  CATCHPHRASES_JA,
  keywordJa,
  behaviorJa,
  catchphraseJa,
} from '../config/npc-generator-flavor-ja.js';
import {
  KEYWORDS_BY_CATEGORY_EN,
  BEHAVIORS_EN,
  CATCHPHRASES_EN,
} from '../config/npc-generator-data.js';

describe('Japanese flavor tables', () => {
  it('translates every behavior and catchphrase', () => {
    expect(BEHAVIORS_EN.filter((b) => !(b in BEHAVIORS_JA))).toEqual([]);
    expect(CATCHPHRASES_EN.filter((c) => !(c in CATCHPHRASES_JA))).toEqual([]);
  });

  it('translates every keyword, in the category it belongs to', () => {
    const missing: string[] = [];
    for (const [category, words] of Object.entries(KEYWORDS_BY_CATEGORY_EN)) {
      for (const word of words) {
        if (!KEYWORDS_JA[category]?.[word]) missing.push(`${category}.${word}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('has no key that no longer matches the English table', () => {
    const behaviors = new Set(BEHAVIORS_EN);
    const catchphrases = new Set(CATCHPHRASES_EN);
    expect(Object.keys(BEHAVIORS_JA).filter((b) => !behaviors.has(b))).toEqual([]);
    expect(Object.keys(CATCHPHRASES_JA).filter((c) => !catchphrases.has(c))).toEqual([]);

    const stale: string[] = [];
    for (const [category, words] of Object.entries(KEYWORDS_JA)) {
      const upstream = new Set(KEYWORDS_BY_CATEGORY_EN[category] ?? []);
      for (const word of Object.keys(words)) {
        if (!upstream.has(word)) stale.push(`${category}.${word}`);
      }
    }
    expect(stale).toEqual([]);
  });

  it('answers undefined rather than a wrong language for an unknown entry', () => {
    expect(behaviorJa('No such behavior')).toBeUndefined();
    expect(catchphraseJa('No such catchphrase')).toBeUndefined();
    expect(keywordJa('role', 'No such keyword')).toBeUndefined();
    // The same word in another category is not a match: `Nomad` is both an
    // origin and a lifestyle, and only the category tells them apart.
    expect(keywordJa('no-such-category', 'Nomad')).toBeUndefined();
    expect(keywordJa('origin', 'Nomad')).toBe('ノマド');
  });

  it('leaves no entry in Latin script only', () => {
    const japanese = /[ぁ-んァ-ヶ一-龠]/;
    const plain = [
      ...Object.values(BEHAVIORS_JA),
      ...Object.values(CATCHPHRASES_JA),
      ...Object.values(KEYWORDS_JA).flatMap((c) => Object.values(c)),
    ].filter((v) => !japanese.test(v));
    expect(plain).toEqual([]);
  });
});

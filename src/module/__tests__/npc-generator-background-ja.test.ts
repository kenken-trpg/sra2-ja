import { afterEach, describe, expect, it, vi } from 'vitest';
import { BACKGROUND_TEXT_JA } from '../config/npc-generator-background-ja.js';
import { PHYSICAL_TRAITS, QUIRKS } from '../config/npc-flavor-data.js';
import { BACKSTORIES, RELATIONSHIPS } from '../config/npc-flavor-data-2.js';
import { FETISH_OBJECTS } from '../config/npc-flavor-data-3.js';
import { tableText } from '../config/npc-generator-i18n.js';

const pools = { PHYSICAL_TRAITS, QUIRKS, BACKSTORIES, RELATIONSHIPS, FETISH_OBJECTS };
afterEach(() => vi.unstubAllGlobals());

describe('Japanese NPC background', () => {
  it('has no key that disappeared from the upstream tables', () => {
    const english = new Set(Object.values(pools).flatMap((pool) => pool.map((e) => e.en)));
    expect(Object.keys(BACKGROUND_TEXT_JA).filter((key) => !english.has(key))).toEqual([]);
  });

  it.each(Object.entries(pools))('covers all %s entries and keeps fr/en output unchanged', (_pool, entries) => {
    for (const entry of entries) {
      const translated = BACKGROUND_TEXT_JA[entry.en];
      expect(translated, entry.en).toMatch(/[ぁ-んァ-ヶ一-龠]/);
      for (const lang of ['ja', 'fr', 'en']) {
        vi.stubGlobal('game', { i18n: { lang } });
        expect(tableText(entry.fr, entry.en, translated))
          .toBe(lang === 'ja' ? translated : lang === 'fr' ? entry.fr : entry.en);
      }
    }
  });

  it('falls back to English for an upstream entry with no translation', () => {
    vi.stubGlobal('game', { i18n: { lang: 'ja' } });
    expect(tableText('nouveau', 'new entry', BACKGROUND_TEXT_JA['new entry'])).toBe('new entry');
  });
});

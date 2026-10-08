import { afterEach, describe, expect, it, vi } from 'vitest';
import { DRONE_NAMES_JA, NARRATIVE_EFFECTS_JA } from '../config/npc-generator-extra-ja.js';
import { NARRATIVE_EFFECTS_EN, NARRATIVE_EFFECTS_FR } from '../config/npc-weapon-effects.js';
import { SMALL_DRONES, MEDIUM_DRONES, LARGE_DRONES } from '../config/npc-drone-data.js';
import { tableText } from '../config/npc-generator-i18n.js';

afterEach(() => vi.unstubAllGlobals());

describe('Japanese generated drone names and weapon effects', () => {
  const drones = [...SMALL_DRONES, ...MEDIUM_DRONES, ...LARGE_DRONES];
  it.each([
    ['drones', drones.map((d) => d.en), DRONE_NAMES_JA],
    ['weapon effects', NARRATIVE_EFFECTS_EN, NARRATIVE_EFFECTS_JA],
  ] as const)('covers every %s without stale keys or untranslated values', (_name, english, japanese) => {
    expect(Object.keys(japanese).sort()).toEqual([...new Set(english)].sort());
    for (const value of Object.values(japanese)) expect(value).toMatch(/[ぁ-んァ-ヶ一-龠]/);
  });

  it('keeps the French and English effect tables aligned', () => {
    expect(NARRATIVE_EFFECTS_FR).toHaveLength(NARRATIVE_EFFECTS_EN.length);
  });

  it('uses Japanese in ja and preserves the French/English tables in fr/en', () => {
    for (const lang of ['ja', 'fr', 'en']) {
      vi.stubGlobal('game', { i18n: { lang } });
      const drone = drones[0]!;
      expect(tableText(drone.fr, drone.en, DRONE_NAMES_JA[drone.en]))
        .toBe(lang === 'ja' ? DRONE_NAMES_JA[drone.en] : lang === 'fr' ? drone.fr : drone.en);
      expect(tableText(NARRATIVE_EFFECTS_FR[0]!, NARRATIVE_EFFECTS_EN[0]!, NARRATIVE_EFFECTS_JA[NARRATIVE_EFFECTS_EN[0]!]))
        .toBe(lang === 'ja' ? NARRATIVE_EFFECTS_JA[NARRATIVE_EFFECTS_EN[0]!] : lang === 'fr' ? NARRATIVE_EFFECTS_FR[0] : NARRATIVE_EFFECTS_EN[0]);
    }
  });
});

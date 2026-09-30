import { describe, it, expect, afterEach } from 'vitest';

import {
  generatorLang,
  skillName,
  specName,
  metatypeName,
  powerLevelLabel,
  archetypeLabel,
  metatypeNameOf,
} from '../config/npc-generator-i18n.js';
import { METATYPES } from '../config/npc-generator-data.js';

/**
 * Minimal game.i18n stub. `table` holds the locale keys this "language"
 * defines; anything else comes back as the key itself, which is what Foundry
 * does for a missing key.
 */
function stubI18n(lang: string, table: Record<string, string> = {}): void {
  (globalThis as any).game = {
    i18n: {
      lang,
      localize: (key: string) => table[key] ?? key,
    },
  };
}

afterEach(() => {
  delete (globalThis as any).game;
});

describe('generatorLang', () => {
  it('uses the French data set only for French', () => {
    stubI18n('fr');
    expect(generatorLang()).toBe('fr');
  });

  it('falls back to the English data set for other languages', () => {
    stubI18n('ja');
    expect(generatorLang()).toBe('en');
    stubI18n('de');
    expect(generatorLang()).toBe('en');
  });
});

describe('label resolution without locale keys', () => {
  it('returns French labels in French', () => {
    stubI18n('fr');
    expect(skillName('close-combat')).toBe('Combat rapproché');
    expect(metatypeName('dwarf')).toBe('Nain');
    expect(archetypeLabel('street-samurai')).toBe('Samouraï des rues');
    expect(powerLevelLabel('elite')).toBe("Runner d'élite");
  });

  it('returns English labels in English instead of French ones', () => {
    stubI18n('en');
    expect(skillName('close-combat')).toBe('Close Combat');
    expect(specName('spec_blades')).toBe('Spec: Blades');
    expect(metatypeName('dwarf')).toBe('Dwarf');
    expect(archetypeLabel('street-samurai')).toBe('Street Samurai');
  });

  it('never leaks French into a language that has no locale keys', () => {
    stubI18n('de');
    expect(skillName('cracking')).toBe('Cracking');
    expect(specName('spec_cybercombat')).toBe('Spec: Cybercombat');
  });
});

describe('label resolution with locale keys', () => {
  it('prefers the locale key over the data table', () => {
    stubI18n('ja', {
      'SRA2.NPC_GEN.SKILLS.close-combat': '近接戦闘',
      'SRA2.NPC_GEN.SPECS.spec_blades': '専門化：ブレード',
      'SRA2.NPC_GEN.METATYPES.dwarf': 'ドワーフ',
      'SRA2.NPC_GEN.POWER_LEVELS.elite': 'エリート・ランナー',
      'SRA2.NPC_GEN.ARCHETYPES.street-samurai': 'ストリート・サムライ',
    });
    expect(skillName('close-combat')).toBe('近接戦闘');
    expect(specName('spec_blades')).toBe('専門化：ブレード');
    expect(metatypeName('dwarf')).toBe('ドワーフ');
    expect(powerLevelLabel('elite')).toBe('エリート・ランナー');
    expect(archetypeLabel('street-samurai')).toBe('ストリート・サムライ');
  });

  it('falls back per key when the locale only covers some of them', () => {
    stubI18n('ja', { 'SRA2.NPC_GEN.SKILLS.close-combat': '近接戦闘' });
    expect(skillName('close-combat')).toBe('近接戦闘');
    expect(skillName('stealth')).toBe('Stealth');
  });
});

describe('unknown keys', () => {
  it('humanizes a slug with no definition', () => {
    stubI18n('en');
    expect(skillName('made-up-skill')).toBe('made up skill');
    expect(specName('spec_made-up')).toBe('made up');
  });
});

describe('profile object lookups', () => {
  it('resolves a profile object through its table key', () => {
    stubI18n('ja', { 'SRA2.NPC_GEN.METATYPES.troll': 'トロール' });
    expect(metatypeNameOf(METATYPES.troll)).toBe('トロール');
  });

  it('returns an empty string for a missing profile', () => {
    stubI18n('en');
    expect(metatypeNameOf(undefined)).toBe('');
  });
});

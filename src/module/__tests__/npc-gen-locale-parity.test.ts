import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

import {
  SKILL_DEFINITIONS,
  SPEC_DEFINITIONS,
  METATYPES,
  POWER_LEVELS,
  ARCHETYPES,
} from '../config/npc-generator-data.js';

/**
 * The generator resolves its labels through SRA2.NPC_GEN.*, so a key added to
 * a data table without a locale entry silently falls back to English. These
 * checks keep the two in step.
 */
const locale = (lang: string): Record<string, Record<string, string>> =>
  JSON.parse(readFileSync(`public/lang/${lang}.json`, 'utf-8')).SRA2.NPC_GEN;

const GROUPS: Array<[string, string[]]> = [
  ['SKILLS', Object.keys(SKILL_DEFINITIONS)],
  ['SPECS', Object.keys(SPEC_DEFINITIONS)],
  ['METATYPES', Object.keys(METATYPES)],
  ['POWER_LEVELS', Object.keys(POWER_LEVELS)],
  ['ARCHETYPES', Object.keys(ARCHETYPES)],
];

describe.each(['en', 'fr', 'ja'])('%s.json NPC_GEN', (lang) => {
  const ng = locale(lang);

  it.each(GROUPS)('covers every %s key', (group, keys) => {
    expect(Object.keys(ng[group] ?? {}).sort()).toEqual([...keys].sort());
  });

  it('has no empty label', () => {
    for (const [group] of GROUPS) {
      for (const [key, value] of Object.entries(ng[group] ?? {})) {
        expect(value, `${group}.${key}`).toBeTruthy();
      }
    }
  });
});

describe('ja.json NPC_GEN', () => {
  it('is actually translated, not copied from English', () => {
    const ja = locale('ja');
    const en = locale('en');
    const copied: string[] = [];
    for (const [group] of GROUPS) {
      for (const key of Object.keys(en[group] ?? {})) {
        if (ja[group]?.[key] === en[group]?.[key]) copied.push(`${group}.${key}`);
      }
    }
    expect(copied).toEqual([]);
  });
});

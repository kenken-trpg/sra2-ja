/**
 * Covers src/module/config/npc-generator-data-ja.ts: the Japanese names for
 * the NPC generator's gear templates.
 *
 * The map is keyed by the upstream French name because the templates have no
 * id or slug. That makes it fragile in one specific way: if upstream renames
 * a template, the key stops matching and the name silently reverts to
 * English. Nothing in the running system would report that, so it is a test.
 */
import { describe, it, expect } from 'vitest';
import { FEAT_NAMES_JA, featNameJa } from '../config/npc-generator-data-ja.js';
import {
  CYBERWARE_TEMPLATES,
  BIOWARE_TEMPLATES,
  WEAPON_TEMPLATES,
  SPELL_TEMPLATES,
  ADEPT_POWER_TEMPLATES,
  COMPLEX_FORM_TEMPLATES,
  EQUIPMENT_TEMPLATES,
  ARMOR_TEMPLATES,
  TRAIT_TEMPLATES,
  CONTACT_TEMPLATES,
  CYBERDECK_TEMPLATES,
  AWAKENED_TEMPLATES,
  EMERGED_TEMPLATES,
  type FeatTemplate,
} from '../config/npc-generator-data.js';

const allTemplates: FeatTemplate[] = [
  ...CYBERWARE_TEMPLATES,
  ...BIOWARE_TEMPLATES,
  ...Object.values(WEAPON_TEMPLATES).flat(),
  ...SPELL_TEMPLATES,
  ...ADEPT_POWER_TEMPLATES,
  ...COMPLEX_FORM_TEMPLATES,
  ...EQUIPMENT_TEMPLATES,
  ...ARMOR_TEMPLATES,
  ...TRAIT_TEMPLATES,
  ...CONTACT_TEMPLATES,
  ...CYBERDECK_TEMPLATES,
  ...AWAKENED_TEMPLATES,
  ...EMERGED_TEMPLATES,
];

/** featType → the set of French names that actually exist upstream. */
const upstream = new Map<string, Set<string>>();
for (const t of allTemplates) {
  if (!upstream.has(t.featType)) upstream.set(t.featType, new Set());
  upstream.get(t.featType)!.add(t.name);
}

const entries = Object.entries(FEAT_NAMES_JA).flatMap(([featType, names]) =>
  Object.entries(names).map(([fr, ja]) => ({ featType, fr, ja })),
);

describe('FEAT_NAMES_JA', () => {
  it('covers at least one template and nothing empty', () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const { featType, fr, ja } of entries) {
      expect(ja, `${featType}/${fr}`).toBeTruthy();
      expect(ja.trim(), `${featType}/${fr}`).toBe(ja);
    }
  });

  it('only uses featType values that exist upstream', () => {
    const unknown = Object.keys(FEAT_NAMES_JA).filter((ft) => !upstream.has(ft));
    expect(unknown).toEqual([]);
  });

  it('has no key that stopped matching an upstream template', () => {
    const orphans = entries
      .filter(({ featType, fr }) => !upstream.get(featType)?.has(fr))
      .map(({ featType, fr }) => `${featType}/${fr}`);
    expect(orphans).toEqual([]);
  });

  it('never leaves the French name as the Japanese one', () => {
    const untranslated = entries.filter(({ fr, ja }) => fr === ja).map(({ fr }) => fr);
    expect(untranslated).toEqual([]);
  });

  it('resolves a known template and falls back for an unknown one', () => {
    const sample = entries[0];
    if (!sample) throw new Error('the map is empty');
    expect(featNameJa(sample.featType, sample.fr)).toBe(sample.ja);
    expect(featNameJa(sample.featType, 'Objet inexistant')).toBeUndefined();
    expect(featNameJa('no-such-type', sample.fr)).toBeUndefined();
  });
});

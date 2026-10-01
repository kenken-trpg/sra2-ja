/**
 * Covers src/module/config/npc-generator-descs-ja.ts: the Japanese
 * descriptions for the NPC generator's gear templates.
 *
 * Two things can go wrong silently here. A key can stop matching upstream, in
 * which case the description reverts to English with nothing reported; and a
 * value can carry different HTML markup from the description it replaces,
 * which Foundry renders without complaint but shows wrong on the sheet. Both
 * are checked below.
 */
import { describe, it, expect } from 'vitest';
import { FEAT_DESCS_JA, featDescJa } from '../config/npc-generator-descs-ja.js';
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

/** featType → French name → the template, as it exists upstream. */
const upstream = new Map<string, Map<string, FeatTemplate>>();
for (const t of allTemplates) {
  if (!upstream.has(t.featType)) upstream.set(t.featType, new Map());
  upstream.get(t.featType)!.set(t.name, t);
}

const entries = Object.entries(FEAT_DESCS_JA).flatMap(([featType, descs]) =>
  Object.entries(descs).map(([fr, ja]) => ({ featType, fr, ja })),
);

/** The ordered sequence of tag names, with attributes stripped. */
function tagSequence(html: string): string[] {
  return (html.match(/<\/?[a-zA-Z][^>]*>/g) ?? []).map((t) =>
    t.toLowerCase().replace(/^<(\/?)\s*([a-z0-9]+)[^>]*>$/, '<$1$2>'),
  );
}

describe('FEAT_DESCS_JA', () => {
  it('covers at least one template and nothing empty or untrimmed', () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const { featType, fr, ja } of entries) {
      expect(ja, `${featType}/${fr}`).toBeTruthy();
      expect(ja, `${featType}/${fr}`).toBe(ja.trim());
    }
  });

  it('uses only featTypes that exist upstream', () => {
    for (const featType of Object.keys(FEAT_DESCS_JA)) {
      expect(upstream.has(featType), featType).toBe(true);
    }
  });

  it('has no orphaned key', () => {
    const orphans = entries
      .filter(({ featType, fr }) => !upstream.get(featType)?.has(fr))
      .map(({ featType, fr }) => `${featType}/${fr}`);
    expect(orphans).toEqual([]);
  });

  it('keeps the HTML tag sequence of the description it replaces', () => {
    const mismatched: string[] = [];
    for (const { featType, fr, ja } of entries) {
      const template = upstream.get(featType)?.get(fr);
      if (!template) continue; // reported by the orphan test
      const source = template.descriptionEn || template.description || '';
      const want = tagSequence(source).join('');
      const got = tagSequence(ja).join('');
      if (want !== got) mismatched.push(`${featType}/${fr}: ${want} vs ${got}`);
    }
    expect(mismatched).toEqual([]);
  });

  it('never leaves the French description in place', () => {
    for (const { featType, fr, ja } of entries) {
      const template = upstream.get(featType)?.get(fr);
      if (!template) continue;
      expect(ja, `${featType}/${fr}`).not.toBe(template.description);
      expect(ja, `${featType}/${fr}`).not.toBe(template.descriptionEn);
    }
  });

  it('resolves a known description and falls back on an unknown one', () => {
    const sample = entries[0];
    if (!sample) throw new Error('the map is empty');
    expect(featDescJa(sample.featType, sample.fr)).toBe(sample.ja);
    expect(featDescJa(sample.featType, 'Objet qui n\'existe pas')).toBeUndefined();
    expect(featDescJa('no-such-feat-type', sample.fr)).toBeUndefined();
  });
});

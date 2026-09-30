/**
 * Localized labels for the NPC generator data tables.
 *
 * The tables in npc-generator-data.ts carry French and English fields
 * (nameFr/nameEn, labelFr/labelEn). Several call sites used to read the
 * French field unconditionally, so the generator produced French labels in
 * every language. These helpers resolve a label for the active language and
 * let a locale file override it, which is how Japanese (and any language
 * added later) gets its own names without touching the data tables.
 */

import {
  SKILL_DEFINITIONS,
  SPEC_DEFINITIONS,
  METATYPES,
  POWER_LEVELS,
  ARCHETYPES,
} from './npc-generator-data.js';

/** Which of the two bundled data languages to fall back to. */
export function generatorLang(): 'fr' | 'en' {
  return (game.i18n?.lang === 'fr') ? 'fr' : 'en';
}

/**
 * Resolve `SRA2.NPC_GEN.<group>.<key>` when the active locale defines it,
 * otherwise fall back to the data table's own French/English field.
 */
function localized(group: string, key: string, fr: string, en: string): string {
  const path = `SRA2.NPC_GEN.${group}.${key}`;
  const translated = game.i18n?.localize(path);
  // Foundry returns the key itself when it is not defined in the locale.
  if (translated && translated !== path) return translated;
  return generatorLang() === 'fr' ? fr : en;
}

/** Human-readable fallback for a slug with no definition at all. */
const humanizeSlug = (slug: string): string =>
  slug.replace(/^spec_/, '').replace(/-/g, ' ');

export function skillName(slug: string): string {
  const def = SKILL_DEFINITIONS[slug];
  if (!def) return humanizeSlug(slug);
  return localized('SKILLS', slug, def.nameFr, def.nameEn);
}

export function specName(slug: string): string {
  const def = SPEC_DEFINITIONS[slug];
  if (!def) return humanizeSlug(slug);
  return localized('SPECS', slug, def.nameFr, def.nameEn);
}

export function metatypeName(key: string): string {
  const def = METATYPES[key];
  if (!def) return humanizeSlug(key);
  return localized('METATYPES', key, def.nameFr, def.nameEn);
}

export function powerLevelLabel(key: string): string {
  const def = POWER_LEVELS[key];
  if (!def) return humanizeSlug(key);
  return localized('POWER_LEVELS', key, def.labelFr, def.labelEn);
}

export function archetypeLabel(key: string): string {
  const def = ARCHETYPES[key];
  if (!def) return humanizeSlug(key);
  return localized('ARCHETYPES', key, def.labelFr, def.labelEn);
}

/**
 * Same lookups for call sites that only hold the profile object.
 * The objects always come from the tables above, so identity finds the key;
 * if it somehow does not, the language field is still a correct answer.
 */
function keyOf<T>(table: Record<string, T>, def: T): string | undefined {
  return Object.keys(table).find((k) => table[k] === def);
}

export function metatypeNameOf(def: { nameFr: string; nameEn: string } | undefined): string {
  if (!def) return '';
  const key = keyOf(METATYPES as Record<string, any>, def);
  return key ? metatypeName(key) : (generatorLang() === 'fr' ? def.nameFr : def.nameEn);
}

export function archetypeLabelOf(def: { labelFr: string; labelEn: string } | undefined): string {
  if (!def) return '';
  const key = keyOf(ARCHETYPES as Record<string, any>, def);
  return key ? archetypeLabel(key) : (generatorLang() === 'fr' ? def.labelFr : def.labelEn);
}

export function powerLevelLabelOf(def: { labelFr: string; labelEn: string } | undefined): string {
  if (!def) return '';
  const key = keyOf(POWER_LEVELS as Record<string, any>, def);
  return key ? powerLevelLabel(key) : (generatorLang() === 'fr' ? def.labelFr : def.labelEn);
}

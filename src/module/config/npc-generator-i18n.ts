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

/**
 * Whether the generator's tables are being read in a language the player did
 * not ask for. The tables ship French and English only, so this is true for
 * every other language, and it is the signal to put the locale's own text on
 * top of whatever the table gave.
 */
export function needsLocaleText(): boolean {
  const lang = game.i18n?.lang;
  return lang !== 'fr' && lang !== 'en';
}

/**
 * One entry of a table that carries both bundled languages. `override` is
 * this locale's own text when there is one, and it wins only where the player
 * is not reading one of the two languages the table is written in.
 */
export function tableText(fr: string, en: string, override?: string): string {
  if (override && needsLocaleText()) return override;
  return generatorLang() === 'fr' ? fr : en;
}

/**
 * The locale's own text for a string already taken from a table, or that
 * string unchanged. For tables picked from before they can be translated,
 * where the pick itself is the key into the locale's side.
 */
export function localeText(text: string, override?: string): string {
  return override && needsLocaleText() ? override : text;
}

/**
 * The name this locale gives a compendium item, or null when it says nothing
 * about it.
 *
 * The generator clones its skills and specializations out of the compendium,
 * which ships in English and French only, so in any other language the clone
 * arrives with a name from whichever of the two was used as the fallback.
 * Putting the locale's own name back on top is the only way those items read
 * in the player's language without a translated pack.
 *
 * It answers null for en and fr: there the pack IS the player's language, and
 * its names are the ones to keep. The two differ in places (`Spé : C&R
 * drones` in the pack against `Spé : C/R drones` here), and the pack is the
 * side the rest of the system shows.
 */
export function compendiumNameOverride(
  group: 'SKILLS' | 'SPECS',
  key: string,
): string | null {
  if (game.i18n?.lang === generatorLang()) return null;
  const path = `SRA2.NPC_GEN.${group}.${key}`;
  const translated = game.i18n?.localize(path);
  return translated && translated !== path ? translated : null;
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

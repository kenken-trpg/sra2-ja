import { SKILL_DEFINITIONS, SPEC_DEFINITIONS } from '../config/npc-generator-data.js';
import { skillName, specName } from '../config/npc-generator-i18n.js';

export interface SkillMetadata {
  linkedSkill?: string;
  linkedAttribute?: string;
}

/** Fill gaps when no world item or compendium supplies a built-in skill. */
export function addDefaultSkillEntries(
  names: Record<string, string>,
  metadata: Record<string, SkillMetadata>,
  reverseNames: Record<string, string>,
): void {
  const normalize = (name: string): string =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  for (const [slug, definition] of Object.entries({ ...SKILL_DEFINITIONS, ...SPEC_DEFINITIONS })) {
    const name = slug.startsWith('spec_') ? specName(slug) : skillName(slug);
    names[slug] ??= name;
    metadata[slug] ??= {
      linkedAttribute: definition.linkedAttribute,
      ...('linkedSkill' in definition ? { linkedSkill: definition.linkedSkill } : {}),
    };
    for (const label of [name, definition.nameFr, definition.nameEn]) {
      reverseNames[normalize(label)] ??= slug;
    }
  }
}

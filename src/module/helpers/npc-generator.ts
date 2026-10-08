/**
 * NPC Generator Engine
 * Procedural generation of complete NPC actors using random tables and budget calculation.
 */

import {
  skillName,
  specName,
  compendiumNameOverride,
  tableText,
  localeText,
  metatypeName,
  metatypeNameOf,
  archetypeLabelOf,
  powerLevelLabelOf,
} from "../config/npc-generator-i18n.js";
import { BACKGROUND_TEXT_JA } from "../config/npc-generator-background-ja.js";
import { generatedNPCFolder } from "./npc-folder.js";
import { pickOne } from "./random.js";
import { ACTOR_ATTRIBUTES, type ActorAttribute } from "../config/constants.js";
import { featNameJa } from "../config/npc-generator-data-ja.js";
import {
  keywordJa,
  behaviorJa,
  catchphraseJa,
} from "../config/npc-generator-flavor-ja.js";
import { DRONE_NAMES_JA, NARRATIVE_EFFECTS_JA } from "../config/npc-generator-extra-ja.js";
import { NARRATIVE_EFFECTS_FR, NARRATIVE_EFFECTS_EN } from "../config/npc-weapon-effects.js";
import { featDescJa } from "../config/npc-generator-descs-ja.js";
import {
  WEAPON_TYPES,
  computeFeatLevel,
  computeFeatCost,
} from "../models/item-feat.js";
import {
  METATYPES,
  POWER_LEVELS,
  ARCHETYPES,
  FIRST_NAMES,
  LAST_NAMES,
  STREET_NAMES,
  KEYWORDS_BY_CATEGORY,
  KEYWORDS_BY_CATEGORY_EN,
  BEHAVIORS,
  BEHAVIORS_EN,
  CATCHPHRASES,
  CATCHPHRASES_EN,
  SKILL_DEFINITIONS,
  SPEC_DEFINITIONS,
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
  feat,
  type FeatTemplate,
  type ArchetypeProfile,
  type MetatypeProfile,
  type PowerLevelProfile,
} from "../config/npc-generator-data.js";
import { PHYSICAL_TRAITS, QUIRKS } from "../config/npc-flavor-data.js";
import { BACKSTORIES, RELATIONSHIPS } from "../config/npc-flavor-data-2.js";
import { FETISH_OBJECTS } from "../config/npc-flavor-data-3.js";

// Magic specialization slugs — used to identify magical foci in equipment pool
const SORCERY_SPEC_SLUGS = [
  'spec_combat-spells', 'spec_detection-spells', 'spec_health-spells',
  'spec_illusion-spells', 'spec_manipulation-spells', 'spec_counterspelling',
];
const CONJURATION_SPEC_SLUGS = [
  'spec_banishing', 'spec_air-spirits', 'spec_earth-spirits', 'spec_fire-spirits',
  'spec_water-spirits', 'spec_beast-spirits',
];
const MAGIC_SPEC_SLUGS = [...SORCERY_SPEC_SLUGS, ...CONJURATION_SPEC_SLUGS, 'spec_astral-combat'];

function isMagicFocus(template: FeatTemplate): boolean {
  const target = template.rrList[0]?.rrTarget;
  return target !== undefined && MAGIC_SPEC_SLUGS.includes(target);
}

function isSorceryFocus(template: FeatTemplate): boolean {
  const target = template.rrList[0]?.rrTarget;
  return target !== undefined && SORCERY_SPEC_SLUGS.includes(target);
}

function isConjurationFocus(template: FeatTemplate): boolean {
  const target = template.rrList[0]?.rrTarget;
  return target !== undefined && CONJURATION_SPEC_SLUGS.includes(target);
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface NPCGeneratorOptions {
  powerLevel: string;
  archetype: string;
  metatype: string;
  gender: string;
  count: number;
}

export async function generateNPCs(
  options: NPCGeneratorOptions,
): Promise<number> {
  const count = Math.max(1, Math.min(5, options.count));
  let created = 0;
  for (let i = 0; i < count; i++) {
    await generateSingleNPC(options);
    created++;
  }
  return created;
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(array: T[], count: number = 1): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

function generateItemId(): string {
  return (foundry as any).utils.randomID(16);
}

// ═══════════════════════════════════════════════════════════════
// NAME GENERATION
// ═══════════════════════════════════════════════════════════════

function generateName(
  gender: string,
  streetNameTheme: string,
): {
  displayName: string;
  firstName: string;
  lastName: string;
  streetName: string;
} {
  const origins = Object.keys(FIRST_NAMES.male);
  const origin1 = pickOne(origins);
  // 50% chance of mixed heritage for last name
  const origin2 = Math.random() < 0.5 ? origin1 : pickOne(origins);

  const genderKey =
    gender === "female" ? "female" : gender === "neutral" ? "neutral" : "male";
  const firstNamePool =
    FIRST_NAMES[genderKey][origin1] ?? FIRST_NAMES.male[origin1] ?? FIRST_NAMES.male.anglo;
  const lastNamePool = LAST_NAMES[origin2] ?? LAST_NAMES.anglo;

  const firstName = pickOne(firstNamePool);
  const lastName = pickOne(lastNamePool);

  // Street name from theme, with 20% chance of picking from 'general' instead
  const themePool = STREET_NAMES[streetNameTheme] ?? STREET_NAMES.general;
  const streetPool = Math.random() < 0.2 ? STREET_NAMES.general : themePool;
  const streetName = pickOne(streetPool);

  return {
    displayName: `${streetName} (${firstName} ${lastName})`,
    firstName,
    lastName,
    streetName,
  };
}

// ═══════════════════════════════════════════════════════════════
// ATTRIBUTE DISTRIBUTION
// ═══════════════════════════════════════════════════════════════

interface AttributeResult {
  attributes: Record<ActorAttribute, number>;
  cost: number;
}

function distributeAttributes(
  archetype: ArchetypeProfile,
  metatype: MetatypeProfile,
  powerLevel: PowerLevelProfile,
): AttributeResult {
  const attrs: Record<ActorAttribute, number> = {
    strength: 1,
    agility: 1,
    willpower: 1,
    logic: 1,
    charisma: 1,
  };
  const maxes = metatype.maxes;
  const priority = archetype.primaryAttributes;

  // Max out the top N attributes based on power level
  for (const attr of priority.slice(0, powerLevel.maxedAttributes)) {
    attrs[attr] = maxes[attr];
  }

  // Distribute remaining points with priority weighting
  // Target: ~14 total points for runner, scaled by budget
  const targetPoints =
    powerLevel.budget <= 300000 ? 12 : powerLevel.budget <= 375000 ? 14 : 16;
  const currentPoints = Object.values(attrs).reduce((s, v) => s + v, 0);
  let remaining = targetPoints - currentPoints;

  // Weight distribution: priority index 0 gets most, decreasing
  const weights = [5, 4, 3, 2, 1];
  const totalWeight = weights.reduce((s, w) => s + w, 0);

  for (let pass = 0; pass < 3 && remaining > 0; pass++) {
    for (const [i, attr] of priority.entries()) {
      if (remaining <= 0) break;
      const max = maxes[attr];
      if (attrs[attr] >= max) continue;

      const share = Math.max(
        1,
        Math.round(((weights[i] ?? 1) / totalWeight) * remaining),
      );
      const canAdd = Math.min(share, max - attrs[attr], remaining);
      attrs[attr] += canAdd;
      remaining -= canAdd;
    }
  }

  // Apply noise: ±1 on some attributes
  for (const attr of priority) {
    if (Math.random() < 0.3) {
      const delta = Math.random() < 0.5 ? 1 : -1;
      const newVal = attrs[attr] + delta;
      if (newVal >= 2 && newVal <= maxes[attr]) {
        attrs[attr] = newVal;
      }
    }
  }

  // Enforce minimum 2 for all attributes (no runner has 1 without RP justification)
  for (const attr of ACTOR_ATTRIBUTES) {
    if (attrs[attr] < 2) attrs[attr] = 2;
  }

  // Enforce maxedAttributes limit: count how many are at max, reduce excess
  const maxAllowed = powerLevel.maxedAttributes;
  let atMaxCount = 0;
  for (const attr of priority) {
    if (attrs[attr] === maxes[attr]) {
      atMaxCount++;
      if (atMaxCount > maxAllowed) {
        // Reduce this attribute by 1 to bring it below max
        attrs[attr] = maxes[attr] - 1;
      }
    }
  }

  // Calculate cost — same formula as CharacterDataModel.calculateAttributeCost
  // Every level costs 10000, except the last (max) which costs 20000
  let cost = 0;
  for (const attr of ACTOR_ATTRIBUTES) {
    const val = attrs[attr];
    const max = maxes[attr];
    for (let i = 1; i <= val; i++) {
      cost += i === max ? 20000 : 10000;
    }
  }

  return { attributes: attrs, cost };
}

// ═══════════════════════════════════════════════════════════════
// SKILL DISTRIBUTION
// ═══════════════════════════════════════════════════════════════

interface SkillResult {
  skills: { slug: string; rating: number }[];
  cost: number;
}

function distributeSkills(
  archetype: ArchetypeProfile,
  powerLevel: PowerLevelProfile,
  budget: number,
): SkillResult {
  const allSkills = {
    ...archetype.primarySkills,
    ...archetype.secondarySkills,
  };
  const skillMax = powerLevel.skillMax;

  // Mandatory base skills: every runner needs at least 2 in these
  const BASE_SKILLS: Record<string, number> = {
    athletics: 2,
    stealth: 2,
    perception: 2,
    influence: 2,
    networking: 2,
  };
  // Merge base skills into allSkills (don't overwrite if archetype already has higher weight)
  for (const [slug, minRating] of Object.entries(BASE_SKILLS)) {
    if (!(slug in allSkills)) {
      allSkills[slug] = minRating;
    }
  }

  // Normalize weights to fit within budget
  const totalWeight = Object.values(allSkills).reduce((s, w) => s + w, 0);

  // Target total skill points: ~35 for runner, scaled
  const targetPoints =
    powerLevel.budget <= 300000 ? 28 : powerLevel.budget <= 375000 ? 35 : 40;

  const skills: { slug: string; rating: number }[] = [];
  let totalCost = 0;

  for (const [slug, weight] of Object.entries(allSkills)) {
    let rating = Math.round((weight / totalWeight) * targetPoints);
    rating = Math.max(1, Math.min(rating, skillMax));

    // Enforce minimum for base runner skills
    const minRating = BASE_SKILLS[slug] ?? 1;
    rating = Math.max(rating, minRating);

    // Apply noise
    if (Math.random() < 0.3) {
      rating += Math.random() < 0.5 ? 1 : -1;
      rating = Math.max(
        minRating,
        Math.min(rating, skillMax),
      );
    }

    // Calculate cost
    let skillCost = 0;
    for (let i = 1; i <= rating; i++) {
      skillCost += i <= 5 ? 2500 : 5000;
    }

    // Check budget
    if (totalCost + skillCost <= budget) {
      skills.push({ slug, rating });
      totalCost += skillCost;
    } else {
      // Reduce rating to fit (but not below base minimum)
      let reducedRating = rating;
      while (reducedRating >= minRating) {
        let reducedCost = 0;
        for (let i = 1; i <= reducedRating; i++) {
          reducedCost += i <= 5 ? 2500 : 5000;
        }
        if (totalCost + reducedCost <= budget) {
          skills.push({ slug: slug, rating: reducedRating });
          totalCost += reducedCost;
          break;
        }
        reducedRating--;
      }
    }
  }

  return { skills, cost: totalCost };
}

// ═══════════════════════════════════════════════════════════════
// SPECIALIZATION SELECTION
// ═══════════════════════════════════════════════════════════════

interface SpecResult {
  specs: string[];
  cost: number;
}

function selectSpecializations(
  archetype: ArchetypeProfile,
  skills: { slug: string; rating: number }[],
  budget: number,
): SpecResult {
  const SPEC_COST = 2500;
  const skillSlugs = new Set(skills.map((s) => s.slug));
  const selected: string[] = [];
  let cost = 0;

  // Always include required specs if the parent skill exists
  for (const specSlug of archetype.requiredSpecs) {
    const specDef = SPEC_DEFINITIONS[specSlug];
    if (
      specDef &&
      skillSlugs.has(specDef.linkedSkill) &&
      cost + SPEC_COST <= budget
    ) {
      selected.push(specSlug);
      cost += SPEC_COST;
    }
  }

  // Always add Défense à distance (every runner needs it)
  if (
    !selected.includes("spec_ranged-defense") &&
    skillSlugs.has("athletics") &&
    cost + SPEC_COST <= budget
  ) {
    selected.push("spec_ranged-defense");
    cost += SPEC_COST;
  }

  // Pick 1-2 optional specs (max 2 optional, total capped to avoid bloat)
  const optionalCount = randomInt(1, 2);
  const validOptional = archetype.optionalSpecs.filter((slug) => {
    const specDef = SPEC_DEFINITIONS[slug];
    return (
      specDef && skillSlugs.has(specDef.linkedSkill) && !selected.includes(slug)
    );
  });

  for (const specSlug of pickRandom(validOptional, optionalCount)) {
    if (cost + SPEC_COST <= budget) {
      selected.push(specSlug);
      cost += SPEC_COST;
    }
  }

  return { specs: selected, cost };
}

// ═══════════════════════════════════════════════════════════════
// FEAT GENERATION
// ═══════════════════════════════════════════════════════════════

interface FeatResult {
  feats: FeatTemplate[];
  cost: number;
  essenceSpent: number;
}

function generateFeats(
  archetype: ArchetypeProfile,
  _powerLevel: PowerLevelProfile,
  budget: number,
): FeatResult {
  const feats: FeatTemplate[] = [];
  let cost = 0;
  let essenceSpent = 0;

  const addFeat = (template: FeatTemplate): boolean => {
    // Compute the real cost exactly as Foundry will (rating * 5000 + base)
    const { level: rating } = computeFeatLevel(template.featType, template);
    const realCost = computeFeatCost(template.featType, {
      ...template,
      rating,
    });
    if (cost + realCost > budget) return false;
    if (
      template.essenceCost > 0 &&
      essenceSpent + template.essenceCost > archetype.maxEssenceLoss
    )
      return false;
    feats.push(template);
    cost += realCost;
    essenceSpent += template.essenceCost;
    return true;
  };

  // 1. Awakened/Emerged feat if needed
  if (archetype.isAwakened) {
    const awakenedType = archetype.primarySkills["conjuration"]
      ? archetype.primarySkills["sorcery"]
        ? AWAKENED_TEMPLATES[1]
        : AWAKENED_TEMPLATES[2]
      : archetype.primarySkills["close-combat"]
        ? AWAKENED_TEMPLATES[3]
        : AWAKENED_TEMPLATES[0];
    addFeat(awakenedType);
  }
  if (archetype.isEmerged) {
    addFeat(EMERGED_TEMPLATES[0]);
  }

  // 2. Cyberware (non-magic archetypes)
  if (archetype.cyberwarePool.length > 0) {
    const cyberPool = [...CYBERWARE_TEMPLATES, ...BIOWARE_TEMPLATES];
    const shuffled = pickRandom(cyberPool, cyberPool.length);
    const maxCyber = randomInt(1, Math.min(4, shuffled.length));
    let cyberCount = 0;
    for (const template of shuffled) {
      if (cyberCount >= maxCyber) break;
      if (addFeat(template)) cyberCount++;
    }
  }

  // 3. Cyberdeck (for deckers)
  if (archetype.primarySkills["cracking"]) {
    const deck = pickOne(CYBERDECK_TEMPLATES);
    addFeat(deck);
  }

  // 4. Spells (for mages/shamans)
  if (archetype.spellPool && archetype.spellPool.length > 0) {
    const spellCount = randomInt(3, 6);
    const spells = pickRandom(SPELL_TEMPLATES, spellCount);
    for (const spell of spells) {
      addFeat(spell);
    }
  }

  // 4b. Magic Focus for awakened (1-2 foci from equipment pool with magic RR)
  // Only add spell foci if archetype has sorcery, spirit foci if archetype has conjuration
  // Respect RR limits: Ganger max RR1, Runner max RR2 (spé only), Elite max RR2
  if (archetype.isAwakened) {
    const allSkills = { ...archetype.primarySkills, ...archetype.secondarySkills };
    const hasSorcery = 'sorcery' in allSkills;
    const hasConjuration = 'conjuration' in allSkills;
    const maxRR = _powerLevel.budget <= 300000 ? 1 : 2; // Ganger: 1, Runner/Elite: 2
    const magicFoci = EQUIPMENT_TEMPLATES.filter(eq => {
      if (!isMagicFocus(eq)) return false;
      if ((eq.rrList[0]?.rrValue ?? 0) > maxRR) return false;
      // Filter by skill: spell foci need sorcery, spirit foci need conjuration
      if (isSorceryFocus(eq) && !hasSorcery) return false;
      if (isConjurationFocus(eq) && !hasConjuration) return false;
      return true;
    });
    if (magicFoci.length > 0) {
      const fociCount = randomInt(1, 2);
      const selectedFoci = pickRandom(magicFoci, fociCount);
      for (const focus of selectedFoci) {
        addFeat(focus);
      }
    }
  }

  // 5. Adept Powers
  if (archetype.adeptPowerPool && archetype.adeptPowerPool.length > 0) {
    const powerCount = randomInt(2, 4);
    const powers = pickRandom(ADEPT_POWER_TEMPLATES, powerCount);
    for (const power of powers) {
      addFeat(power);
    }
  }

  // 6. Complex Forms (technomancer)
  if (archetype.complexFormPool && archetype.complexFormPool.length > 0) {
    const formCount = randomInt(3, 5);
    const forms = pickRandom(COMPLEX_FORM_TEMPLATES, formCount);
    for (const form of forms) {
      addFeat(form);
    }
  }

  // 7. Armor
  const armorMin = archetype.armorRange[0];
  const armorMax = archetype.armorRange[1];
  const targetArmor = randomInt(armorMin, armorMax);
  const armorOptions = ARMOR_TEMPLATES.filter(
    (a) => a.armorValue <= targetArmor,
  );
  // Pick the closest armor to target
  armorOptions.sort(
    (a, b) =>
      Math.abs(b.armorValue - targetArmor) -
      Math.abs(a.armorValue - targetArmor),
  );
  const closestArmor = armorOptions.at(-1);
  if (closestArmor) {
    addFeat(closestArmor);
  }

  // 8. Weapons — at least 1 primary, try for 2
  const weaponCategories = archetype.weaponPool;
  for (const cat of weaponCategories) {
    const catWeapons = WEAPON_TEMPLATES[cat];
    if (catWeapons && catWeapons.length > 0) {
      addFeat(pickOne(catWeapons));
    }
  }

  // 8b. Weapon Focus for Awakened (allows melee weapon use in astral combat)
  if (archetype.isAwakened && feats.some(f => f.featType === 'weapon' && f.weaponType && ['short-weapons', 'long-weapons', 'advanced-melee'].includes(f.weaponType))) {
    // Find the melee weapon and mark it as a weapon focus
    const meleeWeapon = feats.find(f => f.featType === 'weapon' && f.weaponType && ['short-weapons', 'long-weapons', 'advanced-melee'].includes(f.weaponType));
    if (meleeWeapon) {
      (meleeWeapon as any).isWeaponFocus = true;
    }
  }

  // 9. Traits — 1-2 traits (first trait is free: isFirstFeat = true)
  const traitCount = randomInt(1, 2);
  const traits = pickRandom(TRAIT_TEMPLATES, traitCount);
  let isFirstTrait = true;
  for (const trait of traits) {
    if (isFirstTrait) {
      addFeat({ ...trait, isFirstFeat: true });
      isFirstTrait = false;
    } else {
      addFeat(trait);
    }
  }

  // 10. Contacts with RR — 50% chance 1 contact, 20% chance 2 contacts, 30% no contacts
  const contactRoll = Math.random();
  const contactCount = contactRoll < 0.3 ? 0 : contactRoll < 0.8 ? 1 : 2;
  if (contactCount > 0) {
    const contacts = pickRandom(CONTACT_TEMPLATES, contactCount);
    for (const contact of contacts) {
      addFeat(contact);
    }
  }

  // 11. Equipment — fill remaining budget
  const essentialEquipment = EQUIPMENT_TEMPLATES.slice(0, 2); // commlink + SIN always
  for (const eq of essentialEquipment) {
    addFeat(eq);
  }
  // Extra equipment with remaining budget (exclude foci that don't match archetype skills)
  const allSkillKeys = { ...archetype.primarySkills, ...archetype.secondarySkills };
  const mundaneEquipment = EQUIPMENT_TEMPLATES.slice(2).filter(eq => {
    if (!isMagicFocus(eq)) return true; // non-magic equipment always OK
    if (!archetype.isAwakened) return false; // non-awakened: no foci
    if (isSorceryFocus(eq) && !('sorcery' in allSkillKeys)) return false;
    if (isConjurationFocus(eq) && !('conjuration' in allSkillKeys)) return false;
    return true;
  });
  const extraEquipment = pickRandom(mundaneEquipment, 3);
  for (const eq of extraEquipment) {
    addFeat(eq);
  }

  // 12. Ensure at least one offensive feat has a RR
  const offensiveTypes = ['weapon', 'spell', 'cyberdeck', 'adept-power', 'complex-form'];
  const hasOffensiveRR = feats.some(f => offensiveTypes.includes(f.featType) && f.rrList.length > 0);
  if (!hasOffensiveRR) {
    // Find the primary offensive feat and add a RR on its linked spec
    const offensiveFeat = feats.find(f => offensiveTypes.includes(f.featType));
    if (offensiveFeat) {
      // Determine the best RR target based on feat type (label resolved later in buildFeatItem)
      let rrTarget = '';
      if (offensiveFeat.featType === 'weapon' && offensiveFeat.weaponType) {
        const wt = WEAPON_TYPES[offensiveFeat.weaponType as keyof typeof WEAPON_TYPES];
        if (wt) rrTarget = wt.linkedSpecialization;
      } else if (offensiveFeat.featType === 'spell') {
        rrTarget = 'spec_combat-spells';
      } else if (offensiveFeat.featType === 'cyberdeck') {
        rrTarget = 'spec_cybercombat';
      } else if (offensiveFeat.featType === 'adept-power') {
        rrTarget = 'spec_unarmed';
      } else if (offensiveFeat.featType === 'complex-form') {
        rrTarget = 'spec_complex-forms';
      }
      if (rrTarget) {
        offensiveFeat.rrList = [{ rrType: 'specialization', rrValue: 1, rrTarget, rrLabel: rrTarget }];
      }
    }
  }

  return { feats, cost, essenceSpent };
}

// ═══════════════════════════════════════════════════════════════
// FLAVOR GENERATION — Unique background details
// ═══════════════════════════════════════════════════════════════

interface FlavorResult {
  backgroundHtml: string;
  gmDescriptionHtml: string;
}

function generateFlavor(): FlavorResult {
  const label = (key: string) => game.i18n!.localize(`SRA2.NPC_GEN.FLAVOR.${key}`);

  const allPools = [
    { label: label('APPEARANCE'), data: PHYSICAL_TRAITS },
    { label: label('QUIRK'), data: QUIRKS },
    { label: label('ORIGIN'), data: BACKSTORIES },
    { label: label('RELATIONSHIP'), data: RELATIONSHIPS },
    { label: label('ICONIC_ITEM'), data: FETISH_OBJECTS },
  ].filter(p => p.data.length > 0);

  if (allPools.length < 2) {
    return { backgroundHtml: '', gmDescriptionHtml: '' };
  }

  const selected = pickRandom(allPools, 2);
  const entries = selected.map(pool => {
    const entry = pickOne(pool.data);
    const text = tableText(entry.fr, entry.en, BACKGROUND_TEXT_JA[entry.en]);
    return `<p><strong>${pool.label} :</strong> ${text}</p>`;
  });

  return {
    backgroundHtml: entries.join('\n'),
    gmDescriptionHtml: '',
  };
}

// ═══════════════════════════════════════════════════════════════
// PERSONALITY GENERATION
// ═══════════════════════════════════════════════════════════════

interface PersonalityResult {
  keywords: string[];
  behaviors: string[];
  catchphrases: string[];
}

function generatePersonality(
  metatypeKey: string,
  archetypeKey: string,
  gender: string,
): PersonalityResult {
  const metatype = METATYPES[metatypeKey];
  const archetype = ARCHETYPES[archetypeKey];
  const isEn = getLang() === 'en';

  // Keywords: 1 from each category (use language-specific tables)
  const keywordsTable = isEn ? KEYWORDS_BY_CATEGORY_EN : KEYWORDS_BY_CATEGORY;
  const keywords: string[] = [];
  for (const [cat, pool] of Object.entries(keywordsTable)) {
    const picked = pickOne(pool);
    keywords.push(localeText(picked, keywordJa(cat, picked)));
  }

  // Replace keywords to match the actual metatype + gender
  const metatypeName = metatypeNameOf(metatype);
  const genderLabel = game.i18n!.localize(
    gender === 'female' ? 'SRA2.NPC_GEN.GENDER.WOMAN' : 'SRA2.NPC_GEN.GENDER.MAN',
  );
  if (metatype) {
    keywords[0] = `${metatypeName} — ${genderLabel}`;
  }
  // Force the "role" keyword (index 2) to match the archetype
  const archetypeLabel = archetypeLabelOf(archetype);
  keywords[2] = archetypeLabel;

  const behaviors = pickRandom(isEn ? BEHAVIORS_EN : BEHAVIORS, 4).map((b) =>
    localeText(b, behaviorJa(b)),
  );
  const catchphrases = pickRandom(isEn ? CATCHPHRASES_EN : CATCHPHRASES, 4).map(
    (c) => localeText(c, catchphraseJa(c)),
  );

  return { keywords, behaviors, catchphrases };
}

// ═══════════════════════════════════════════════════════════════
// IMAGE PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════

const METATYPE_VISUALS: Record<string, string> = {
  human: 'human, average build',
  elf: 'elf with pointed ears, tall and slender, sharp elegant features',
  dwarf: 'dwarf, short and stocky, thick-boned, broad shoulders',
  ork: 'ork with prominent tusks, muscular, heavy brow, green-tinged skin',
  troll: 'troll, massive 2.5m tall, horns on head, dermal bone deposits, imposing frame',
};

const ARCHETYPE_VISUALS: Record<string, string> = {
  'street-samurai': 'cybernetically enhanced street warrior, chrome implants visible, combat-ready stance, military-grade gear',
  'decker': 'hacker with cyberdeck strapped to arm, neural cables, AR interface glowing near eyes, tech-savvy look',
  'mage': 'awakened magician, faint magical aura, mystical symbols on clothing, arcane focus in hand',
  'shaman': 'urban shaman with tribal markings, spirit fetishes, bones and totems woven into clothing, primal energy',
  'adept': 'physical adept, lean muscular build, martial arts stance, subtle magical glow on fists, no visible cyberware',
  'rigger': 'drone operator with control rig visible at temple, multiple drone controllers on belt, datajack, tech vest with antennas',
  'face': 'charismatic social operator, expensive but practical clothes, confident posture, subtle earpiece, sharp eyes',
  'technomancer': 'technomancer with no visible tech, data streams visible as faint AR overlay, intense focused gaze, resonance shimmer',
  'infiltrator': 'stealth specialist in dark tactical gear, hood or mask, slim silhouette, utility belt with infiltration tools',
};

const STYLE_SUFFIXES = [
  'neo-noir cyberpunk atmosphere, rain-slicked neon streets, megacorp holographic ads towering in the background, steam rising from sewer grates',
  'dark Shadowrun universe, volumetric neon lighting cutting through smog, sprawl cityscape with corporate arcologies looming behind',
  'Shadowrun 6th World character art, detailed cyberpunk-fantasy illustration, magic and technology intertwined, dangerous urban sprawl',
  'cinematic dystopian portrait, dramatic chiaroscuro lighting, Blade Runner meets urban fantasy, AR icons flickering in the air',
  'gritty Sixth World street scene, neon kanji signs, armored corporate drones overhead, shadows hiding chrome-enhanced predators',
  'dark cyberpunk portrait, crumbling Barrens architecture mixed with gleaming corporate towers, toxic rain, electric glow of the Matrix',
  'Shadowrun aesthetic, where elves carry assault rifles and trolls hack the Matrix, neon-drenched dystopia where magic returned to a broken world',
];

function generateImagePrompt(
  metatypeKey: string,
  archetypeKey: string,
  gender: string,
  flavorBg: string,
  items: any[],
  keywords: string[],
  behaviors: string[],
  skills: { slug: string; rating: number }[],
): string {
  const parts: string[] = [];

  // Base character description
  const genderDesc = gender === 'female' ? 'female' : gender === 'neutral' ? 'androgynous' : 'male';
  const metatypeVisual = METATYPE_VISUALS[metatypeKey] || 'metahuman';
  const archetypeVisual = ARCHETYPE_VISUALS[archetypeKey] || 'shadowrunner';

  parts.push(`Full body portrait of a ${genderDesc} ${metatypeVisual} shadowrunner in the Sixth World — a dark dystopian future where magic, megacorporations, and cybernetic technology coexist. ${archetypeVisual}`);

  // Keywords — the most important identity descriptors
  if (keywords.length > 0) {
    parts.push(`Identity: ${keywords.join(', ')}`);
  }

  // Top 5 skills — describe what this runner is visually known for
  const topSkills = [...skills].sort((a, b) => b.rating - a.rating).slice(0, 5);
  if (topSkills.length > 0) {
    const skillDescs = topSkills.map(s => {
      return skillName(s.slug);
    });
    parts.push(`Expert in: ${skillDescs.join(', ')} — this expertise should be visually apparent in their posture, gear, and attitude`);
  }

  // Extract ALL flavor traits from bio
  const traitMatches = flavorBg.matchAll(/<strong>[^<]*:<\/strong>\s*([^<]+)/g);
  for (const match of traitMatches) {
    if (match[1]) parts.push(match[1].trim());
  }

  // Behaviors — pick the most visually evocative ones
  if (behaviors.length > 0) {
    const visualBehavior = behaviors.slice(0, 2).join('. ');
    parts.push(`Personality visible through body language: ${visualBehavior}`);
  }

  // Describe visible cyberware
  const cyberware = items.filter((it: any) => it.type === 'feat' && it.system?.featType === 'cyberware' && !it.system?.isBioware);
  if (cyberware.length > 0) {
    const cyberNames = cyberware.slice(0, 3).map((c: any) => c.name).join(', ');
    parts.push(`Visible cyberware: ${cyberNames}`);
  }

  // Describe armor prominently — armor defines the runner's silhouette
  const armor = items.find((it: any) => it.type === 'feat' && it.system?.featType === 'armor');
  if (armor) {
    const av = armor.system?.armorValue || 0;
    const armorDesc = av >= 4
      ? `Wearing heavy ${armor.name}, bulky military-grade protection clearly visible, tactical plates and reinforced padding`
      : av >= 3
        ? `Wearing ${armor.name}, armored coat or vest clearly visible under clothing, reinforced shoulders and chest`
        : `Wearing ${armor.name}, light ballistic protection visible — reinforced jacket or concealed vest`;
    parts.push(armorDesc);
  }

  // Describe weapons
  const weapons = items.filter((it: any) => it.type === 'feat' && it.system?.featType === 'weapon');
  const primaryWeapon = weapons.find((w: any) => w.system?.bookmarked) || weapons[0];
  if (primaryWeapon) {
    parts.push(`Carrying ${primaryWeapon.name} as primary weapon`);
  }
  if (weapons.length > 1) {
    const secondary = weapons.find((w: any) => w !== primaryWeapon);
    if (secondary) parts.push(`${secondary.name} holstered or sheathed`);
  }

  // Cyberdeck if decker
  const cyberdeck = items.find((it: any) => it.type === 'feat' && it.system?.featType === 'cyberdeck');
  if (cyberdeck) {
    parts.push(`${cyberdeck.name} strapped to forearm, holographic interface glowing`);
  }

  // Style suffix
  parts.push(pickOne(STYLE_SUFFIXES));

  // Quality directives
  parts.push('Highly detailed character illustration, sharp focus on face and equipment, dramatic pose, professional RPG character art quality');

  return parts.join('. ') + '.';
}

// ═══════════════════════════════════════════════════════════════
// COMPENDIUM LOADER
// ═══════════════════════════════════════════════════════════════

/** Cached compendium items per language */
let compendiumCache: Record<string, any[]> = {};

/** Get the active language ('fr' or 'en') */
function getLang(): 'fr' | 'en' {
  return (game.i18n?.lang === 'fr') ? 'fr' : 'en';
}

/** Thousands separators for the player's own language, not the table's. */
function nuyen(amount: number): string {
  return amount.toLocaleString(game.i18n?.lang || 'en');
}

async function getCompendiumItems(): Promise<any[]> {
  const lang = getLang();
  if (compendiumCache[lang]) return compendiumCache[lang];

  // Prefer the language-specific pack (anarchy-items-fr or anarchy-items-en)
  const preferredSuffix = `-${lang}`;
  const items: any[] = [];
  for (const pack of game.packs as any) {
    if (pack.documentName !== "Item") continue;
    // Only load the pack matching the active language
    if (!pack.collection.endsWith(preferredSuffix)) continue;
    try {
      const docs = await pack.getDocuments();
      for (const doc of docs) {
        items.push(doc.toObject());
      }
    } catch (err) {
      console.warn("NPC Generator: failed to load pack", pack.collection, err);
    }
  }
  // Fallback: if no items found for this language, load all packs
  if (items.length === 0) {
    for (const pack of game.packs as any) {
      if (pack.documentName !== "Item") continue;
      try {
        const docs = await pack.getDocuments();
        for (const doc of docs) {
          items.push(doc.toObject());
        }
      } catch (err) { /* ignore */ }
    }
  }
  compendiumCache[lang] = items;
  return items;
}

/**
 * Resolve an RR label from its target slug using compendium items.
 * For specialization slugs, finds the compendium name. For skill slugs, finds the skill name.
 * Falls back to SKILL_DEFINITIONS/SPEC_DEFINITIONS for static data.
 */
function resolveRRLabel(compendiumItems: any[], rrTarget: string, rrType: string): string {
  if (!rrTarget) return '';
  if (rrType === 'specialization' || rrTarget.startsWith('spec_')) {
    const comp = compendiumItems.find((it: any) => it.type === 'specialization' && it.system?.slug === rrTarget);
    if (comp) return comp.name;
    if (SPEC_DEFINITIONS[rrTarget]) return specName(rrTarget);
  } else if (rrType === 'skill') {
    const comp = compendiumItems.find((it: any) => it.type === 'skill' && it.system?.slug === rrTarget);
    if (comp) return comp.name;
    if (SKILL_DEFINITIONS[rrTarget]) return skillName(rrTarget);
  } else if (rrType === 'attribute') {
    return rrTarget;
  }
  return rrTarget;
}

function findCompendiumItem(
  compendiumItems: any[],
  type: string,
  slug: string,
): any | null {
  return (
    compendiumItems.find(
      (item: any) => item.type === type && item.system?.slug === slug,
    ) ?? null
  );
}

// ═══════════════════════════════════════════════════════════════
// ITEM BUILDERS
// ═══════════════════════════════════════════════════════════════

function buildMetatypeItem(
  metatypeKey: string,
  metatype: MetatypeProfile,
  compendiumItems?: any[],
): any {
  // Try to find metatype in compendium first (for correct language)
  if (compendiumItems) {
    // Metatype names in compendium: Humain/Human, Elfe/Elf, etc.
    const compMetatype = compendiumItems.find((it: any) =>
      it.type === 'metatype' && (it.name === metatype.nameFr || it.name === metatype.nameEn)
    );
    if (compMetatype) {
      const item = JSON.parse(JSON.stringify(compMetatype));
      item._id = generateItemId();
      item.sort = 0;
      delete item._stats;
      delete item.ownership;
      delete item._key;
      delete item.folder;
      return item;
    }
  }
  const mtName = metatypeName(metatypeKey);
  return {
    name: mtName,
    type: "metatype",
    _id: generateItemId(),
    img: metatype.img,
    system: {
      description: `<p>${mtName}</p>`,
      maxStrength: metatype.maxes.strength,
      maxAgility: metatype.maxes.agility,
      maxWillpower: metatype.maxes.willpower,
      maxLogic: metatype.maxes.logic,
      maxCharisma: metatype.maxes.charisma,
      anarchyBonus: metatype.anarchyBonus,
      reference: "",
    },
    effects: [],
    flags: {},
    sort: 0,
  };
}

function buildSkillItem(
  compendiumItems: any[],
  slug: string,
  rating: number,
  sortIndex: number,
): any {
  const compItem = findCompendiumItem(compendiumItems, "skill", slug);
  if (compItem) {
    // Clone from compendium, override rating and sort
    const item = JSON.parse(JSON.stringify(compItem));
    item._id = generateItemId();
    item.system.rating = rating;
    item.system.bookmarked = sortIndex === 0;
    item.sort = (sortIndex + 1) * 100;
    // The pack is English or French, so in any other language the clone needs
    // this locale's own name.
    const localName = compendiumNameOverride('SKILLS', slug);
    if (localName) item.name = localName;
    // Remove compendium source flags
    delete item._stats;
    delete item.ownership;
    delete item._key;
    delete item.folder;
    return item;
  }
  // Fallback: build manually if not in compendium
  const def = SKILL_DEFINITIONS[slug];
  if (!def) return null;
  return {
    name: skillName(slug),
    type: "skill",
    _id: generateItemId(),
    img: "icons/svg/item-bag.svg",
    system: {
      rating,
      linkedAttribute: def.linkedAttribute,
      description: "",
      bookmarked: sortIndex === 0,
      reference: "",
      slug,
    },
    effects: [],
    flags: {},
    sort: (sortIndex + 1) * 100,
  };
}

function buildSpecItem(
  compendiumItems: any[],
  specSlug: string,
  sortIndex: number,
): any {
  const compItem = findCompendiumItem(
    compendiumItems,
    "specialization",
    specSlug,
  );
  if (compItem) {
    const item = JSON.parse(JSON.stringify(compItem));
    item._id = generateItemId();
    item.sort = (sortIndex + 100) * 100;
    const localName = compendiumNameOverride('SPECS', specSlug);
    if (localName) item.name = localName;
    delete item._stats;
    delete item.ownership;
    delete item._key;
    delete item.folder;
    return item;
  }
  // Fallback
  const def = SPEC_DEFINITIONS[specSlug];
  if (!def) return null;
  return {
    name: specName(specSlug),
    type: "specialization",
    _id: generateItemId(),
    img: "icons/svg/item-bag.svg",
    system: {
      linkedSkill: def.linkedSkill,
      linkedAttribute: def.linkedAttribute,
      description: "",
      bookmarked: false,
      reference: "",
      slug: specSlug,
    },
    effects: [],
    flags: {},
    sort: (sortIndex + 100) * 100,
  };
}

function buildFeatItem(template: FeatTemplate, sortIndex: number, compendiumItems?: any[]): any {
  // Resolve weapon data from WEAPON_TYPES
  let meleeRange = template.meleeRange ?? "none";
  let shortRange = template.shortRange ?? "none";
  let mediumRange = template.mediumRange ?? "none";
  let longRange = template.longRange ?? "none";
  let linkedAttackSkill = "";
  let linkedAttackSpecialization = "";
  let linkedDefenseSkill = "";
  let linkedDefenseSpecialization = "";

  if (template.weaponType && template.weaponType in WEAPON_TYPES) {
    const wt = WEAPON_TYPES[template.weaponType as keyof typeof WEAPON_TYPES];
    meleeRange = wt.melee;
    shortRange = wt.short;
    mediumRange = wt.medium;
    longRange = wt.long;
    linkedAttackSkill = wt.linkedSkill;
    linkedAttackSpecialization = wt.linkedSpecialization;
    linkedDefenseSkill = wt.linkedDefenseSkill;
    linkedDefenseSpecialization = wt.linkedDefenseSpecialization;
  }

  // Resolve damageValue based on vdMode
  let damageValue = template.damageValue ?? "0";
  const vdMode = template.vdMode ?? "custom";
  if (vdMode === "custom") {
    damageValue = String(template.vdCustomValue ?? 0);
  } else if (vdMode === "attribute") {
    const attr = template.vdAttribute ?? "strength";
    const bonus = template.vdBonus ?? 0;
    const strLabel = getLang() === 'fr' ? 'FOR' : 'STR';
    if (attr === "strength") {
      damageValue = bonus === 0 ? strLabel : `${strLabel}+${bonus}`;
    } else {
      damageValue =
        bonus === 0 ? attr.toUpperCase() : `${attr.toUpperCase()}+${bonus}`;
    }
  }

  // Calculate the correct rating using the shared computation function
  const { level: rating } = computeFeatLevel(template.featType, template);

  // Resolve localized name and description.
  // Japanese names and descriptions live in npc-generator-data-ja.ts and
  // npc-generator-descs-ja.ts rather than in the data table; a template with
  // no entry there falls back to English, which is what every language other
  // than French already did.
  const isEn = getLang() === 'en';
  const isJa = game.i18n?.lang === 'ja';
  const baseName = (isEn && template.nameEn) ? template.nameEn : template.name;
  const featName = (isJa && featNameJa(template.featType, template.name)) || baseName;
  const baseDesc = (isEn && template.descriptionEn) ? template.descriptionEn : template.description;
  const featDesc = (isJa && featDescJa(template.featType, template.name)) || baseDesc;

  return {
    name: featName,
    type: "feat",
    _id: generateItemId(),
    img: "icons/svg/item-bag.svg",
    system: {
      description: featDesc || "",
      gmDescription: "",
      bookmarked: template.bookmarked ?? false,
      rating,
      cost: template.cost,
      active: true,
      featType: template.featType,
      weaponType: template.weaponType ?? "",
      vehicleType: "",
      damageValue,
      damageValueBonus: template.damageValueBonus ?? 0,
      vdMode: template.vdMode ?? "custom",
      vdCustomValue: template.vdCustomValue ?? 0,
      vdAttribute: template.vdAttribute ?? "strength",
      vdBonus: template.vdBonus ?? 0,
      damageType: template.damageType ?? "physical",
      meleeRange,
      shortRange,
      mediumRange,
      longRange,
      rangeImprovements: {
        melee: false,
        short: false,
        medium: false,
        long: false,
      },
      linkedAttackSkill,
      linkedAttackSpecialization,
      linkedDefenseSkill,
      linkedDefenseSpecialization,
      rrList: compendiumItems
        ? template.rrList.map(rr => ({ ...rr, rrLabel: resolveRRLabel(compendiumItems, rr.rrTarget, rr.rrType) }))
        : template.rrList,
      bonusLightDamage: template.bonusLightDamage,
      bonusSevereDamage: template.bonusSevereDamage,
      bonusPhysicalThreshold: template.bonusPhysicalThreshold,
      bonusMentalThreshold: template.bonusMentalThreshold,
      bonusMatrixThreshold: template.bonusMatrixThreshold,
      armorValue: template.armorValue,
      bonusAnarchy: template.bonusAnarchy,
      essenceCost: template.essenceCost,
      isBioware: template.isBioware,
      // Awakened checkboxes
      astralPerception: template.astralPerception ?? false,
      astralProjection: template.astralProjection ?? false,
      sorcery: template.sorcery ?? false,
      conjuration: template.conjuration ?? false,
      adept: template.adept ?? false,
      // First feat flag
      isFirstFeat: template.isFirstFeat ?? false,
      // Weapon focus (for awakened melee weapons in astral combat)
      isWeaponFocus: (template as any).isWeaponFocus ?? false,
      // Cyberdeck stats
      firewall: template.firewall ?? 0,
      attack: template.attack ?? 0,
      cyberdeckBiofeedback: false,
      cyberdeckBiofeedbackFilter: false,
      cyberdeckConnectionLock: false,
      // Emerged checkboxes
      matrixAccess: template.matrixAccess ?? false,
      complexFormWeaving: template.complexFormWeaving ?? false,
      spriteCompilation: template.spriteCompilation ?? false,
      biofeedback: template.biofeedback ?? false,
      isOptional: false,
      isAChoice: false,
      numberOfChoice: 1,
      reference: "",
    },
    effects: [],
    flags: {},
    sort: (sortIndex + 200) * 100,
  };
}

// ═══════════════════════════════════════════════════════════════
// DRONE CREATION (for Riggers)
// ═══════════════════════════════════════════════════════════════

async function createRiggerDrones(actor: any, folder: any): Promise<void> {
  let droneNames: { small: any[]; medium: any[]; large: any[] };
  try {
    const d = await import('../config/npc-drone-data.js');
    droneNames = { small: d.SMALL_DRONES, medium: d.MEDIUM_DRONES, large: d.LARGE_DRONES };
  } catch {
    return; // Drone data not available
  }

  const linkedVehicles: string[] = [];

  // Pick drones: 1 small + (1 medium OR 1 large atypique)
  const smallDrone = pickOne(droneNames.small);
  const useLarge = Math.random() < 0.3; // 30% chance of getting a weird large drone
  const secondDrone = useLarge ? pickOne(droneNames.large) : pickOne(droneNames.medium);

  for (const drone of [smallDrone, secondDrone]) {
    const droneName = tableText(drone.fr, drone.en, DRONE_NAMES_JA[drone.en]);
    const droneActor = await (Actor as any).create({
      name: droneName,
      type: 'vehicle',
      img: 'icons/svg/item-bag.svg',
      folder: folder?.id ?? null,
      system: {
        vehicleType: drone.type,
        controlMode: 'autonomous',
      },
    });
    if (droneActor) {
      linkedVehicles.push(droneActor.uuid);
    }
  }

  // Link drones to the rigger
  if (linkedVehicles.length > 0) {
    const existingLinks = actor.system.linkedVehicles || [];
    await actor.update({ 'system.linkedVehicles': [...existingLinks, ...linkedVehicles] });
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN GENERATION
// ═══════════════════════════════════════════════════════════════

async function generateSingleNPC(options: NPCGeneratorOptions): Promise<void> {
  // 1. Resolve random choices
  const archetypeKey =
    options.archetype === "random"
      ? pickOne(Object.keys(ARCHETYPES))
      : options.archetype;
  const metatypeKey =
    options.metatype === "random"
      ? pickOne(Object.keys(METATYPES))
      : options.metatype;

  const archetype = ARCHETYPES[archetypeKey];
  const metatype = METATYPES[metatypeKey];
  const powerLevel = POWER_LEVELS[options.powerLevel] ?? POWER_LEVELS.runner;

  if (!archetype || !metatype) {
    ui.notifications?.error(game.i18n!.localize('SRA2.NPC_GENERATOR.INVALID_SELECTION'));
    return;
  }

  // 2. Load compendium items + resolve language
  const compendiumItems = await getCompendiumItems();
  const mtName = metatypeNameOf(metatype);
  const archLabel = archetypeLabelOf(archetype);
  const plLabel = powerLevelLabelOf(powerLevel);

  // Resolve random gender
  const resolvedGender = options.gender === 'random' || !options.gender
    ? (Math.random() < 0.5 ? 'male' : 'female')
    : options.gender;
  options.gender = resolvedGender;

  // 3. Generate name
  const name = generateName(options.gender, archetype.streetNameTheme);

  // 3. Distribute attributes
  const attrResult = distributeAttributes(archetype, metatype, powerLevel);

  // 4. Distribute skills
  const skillBudget = Math.floor((powerLevel.budget - attrResult.cost) * 0.35);
  const skillResult = distributeSkills(archetype, powerLevel, skillBudget);

  // 5. Select specializations
  const specBudget = Math.floor(
    (powerLevel.budget - attrResult.cost - skillResult.cost) * 0.1,
  );
  const specResult = selectSpecializations(
    archetype,
    skillResult.skills,
    specBudget,
  );

  // 6. Generate feats
  const featBudget =
    powerLevel.budget - attrResult.cost - skillResult.cost - specResult.cost;
  const featResult = generateFeats(archetype, powerLevel, featBudget);

  // 6b. Add weapon specialization for primary weapon (linkedSpecialization is already a slug)
  const primaryWeapon = featResult.feats.find(
    (f) => f.featType === "weapon" && f.weaponType,
  );
  if (primaryWeapon?.weaponType && primaryWeapon.weaponType in WEAPON_TYPES) {
    const wt = WEAPON_TYPES[primaryWeapon.weaponType as keyof typeof WEAPON_TYPES];
    const weaponSpecSlug = wt.linkedSpecialization; // Already a slug like "spec_blades"
    if (weaponSpecSlug && !specResult.specs.includes(weaponSpecSlug)) {
      specResult.specs.push(weaponSpecSlug);
    }
  }

  // 7. Generate personality + flavor
  const personality = generatePersonality(metatypeKey, archetypeKey, options.gender);
  const flavor = generateFlavor();

  // 8. Build items array
  const items: any[] = [];

  // Metatype
  items.push(buildMetatypeItem(metatypeKey, metatype, compendiumItems));

  // Skills (from compendium)
  skillResult.skills.forEach((s, i) => {
    const item = buildSkillItem(compendiumItems, s.slug, s.rating, i);
    if (item) items.push(item);
  });

  // Specializations (from compendium)
  specResult.specs.forEach((slug, i) => {
    const item = buildSpecItem(compendiumItems, slug, i);
    if (item) items.push(item);
  });

  // Feats
  featResult.feats.forEach((template, i) => {
    items.push(buildFeatItem(template, i, compendiumItems));
  });

  // The primary weapon can add a specialization outside the archetype's skills.
  // Include its parent before budgeting, rather than relying on the createItem
  // hook to find a template in a compendium which may not be installed.
  for (const specialization of items.filter((item) => item.type === 'specialization')) {
    const slug: string = specialization.system.linkedSkill;
    if (items.some((item) => item.type === 'skill' && item.system.slug === slug)) continue;
    const skill = buildSkillItem(compendiumItems, slug, 1, skillResult.skills.length);
    if (skill) {
      items.push(skill);
      skillResult.skills.push({ slug, rating: 1 });
    }
  }

  // 9. Spend surplus: upgrade skills, add specs/equipment until < 10k ¥ remaining
  // Reserve budget for rigger drones (2 drones × 5000¥ base cost each)
  const droneReserve = archetypeKey === 'rigger' ? 10000 : 0;

  // First compute accurate total from built items (same formulas as Foundry)
  const recomputeTotal = (): number => {
    let total = attrResult.cost + droneReserve;
    for (const item of items) {
      if (item.type === "skill") {
        const r = item.system.rating || 0;
        total += r <= 5 ? r * 2500 : 5 * 2500 + (r - 5) * 5000;
      } else if (item.type === "specialization") {
        total += 2500;
      } else if (item.type === "feat") {
        total += computeFeatCost(item.system.featType, item.system);
      }
    }
    return total;
  };

  let totalSpent = recomputeTotal();
  let surplus = powerLevel.budget - totalSpent;

  // 9a. Upgrade primary skills (up to 5 upgrades)
  const primarySlugs = Object.keys(archetype.primarySkills);
  let skillUpgrades = 0;
  while (surplus >= 10000 && skillUpgrades < 5) {
    const upgradeable = skillResult.skills.filter(
      (s) => s.rating < powerLevel.skillMax && primarySlugs.includes(s.slug),
    );
    if (upgradeable.length === 0) break;
    upgradeable.sort((a, b) => b.rating - a.rating);
    const skill = upgradeable[0];
    if (!skill) break;
    const upgradeCost = skill.rating < 5 ? 2500 : 5000;
    if (upgradeCost > surplus) break;
    skill.rating += 1;
    skillUpgrades++;
    const skillItem = items.find(
      (it: any) => it.type === "skill" && it.system?.slug === skill.slug,
    );
    if (skillItem) skillItem.system.rating = skill.rating;
    totalSpent = recomputeTotal();
    surplus = powerLevel.budget - totalSpent;
  }

  // 9b. Upgrade 1-2 attributes (+1 each, max 2 points total)
  // Count how many are already at max
  const currentMaxed = ACTOR_ATTRIBUTES.filter(
    a => attrResult.attributes[a] === metatype.maxes[a]
  ).length;
  let attrUpgrades = 0;
  while (surplus >= 20000 && attrUpgrades < 2) {
    // Find attributes below max, excluding those that would exceed maxedAttributes limit
    const canAddNewMax = currentMaxed + attrUpgrades < powerLevel.maxedAttributes;
    const upgradeable = archetype.primaryAttributes.filter((attr) => {
      const current = attrResult.attributes[attr];
      const max = metatype.maxes[attr];
      if (current >= max) return false;
      // If upgrading would reach max and we can't add a new maxed attribute, skip
      if (current + 1 === max && !canAddNewMax) return false;
      return true;
    });
    if (upgradeable.length === 0) break;
    const attr = upgradeable[0];
    if (!attr) break;
    attrResult.attributes[attr] += 1;
    attrUpgrades++;
    // Recompute attribute cost AFTER the change
    attrResult.cost = 0;
    for (const a of ACTOR_ATTRIBUTES) {
      const val = attrResult.attributes[a];
      const max = metatype.maxes[a];
      for (let i = 1; i <= val; i++) {
        attrResult.cost += i === max ? 20000 : 10000;
      }
    }
    totalSpent = recomputeTotal();
    surplus = powerLevel.budget - totalSpent;
  }

  // 9b2. UPGRADE CYBERDECK — priority for deckers
  const cyberdeckItem = items.find((it: any) => it.type === 'feat' && it.system?.featType === 'cyberdeck');
  if (cyberdeckItem && archetypeKey === 'decker') {
    const deckSys = cyberdeckItem.system;

    // Phase 1: Boost firewall/attack (up to +4 total, max 5 each)
    let deckStatUpgrades = 0;
    while (surplus >= 10000 && deckStatUpgrades < 4) {
      const fw = deckSys.firewall || 0;
      const atk = deckSys.attack || 0;
      if (fw >= 5 && atk >= 5) break;
      const boostField = fw <= atk ? 'firewall' : 'attack';
      if ((deckSys[boostField] || 0) >= 5) {
        const otherField = boostField === 'firewall' ? 'attack' : 'firewall';
        if ((deckSys[otherField] || 0) >= 5) break;
        deckSys[otherField] = (deckSys[otherField] || 0) + 1;
      } else {
        deckSys[boostField] = (deckSys[boostField] || 0) + 1;
      }
      deckSys.rating = computeFeatLevel(deckSys.featType, deckSys).level;
      deckStatUpgrades++;
      totalSpent = recomputeTotal();
      surplus = powerLevel.budget - totalSpent;
    }

    // Phase 2: Add cyberdeck programs (each +1 level = +5000¥)
    // Only `field` is read: the program names the sheet shows come from the
    // cyberdeck feat's own locale keys, not from here.
    const programs = [
      { field: 'cyberdeckBiofeedback' },
      { field: 'cyberdeckBiofeedbackFilter' },
      { field: 'cyberdeckConnectionLock' },
    ];
    // Pick 1-3 programs randomly
    const programCount = randomInt(1, 3);
    const selectedPrograms = pickRandom(programs, programCount);
    for (const prog of selectedPrograms) {
      if (surplus >= 5000 && !deckSys[prog.field]) {
        deckSys[prog.field] = true;
        deckSys.rating = computeFeatLevel(deckSys.featType, deckSys).level;
        totalSpent = recomputeTotal();
        surplus = powerLevel.budget - totalSpent;
      }
    }
  }

  // 9b3. UPGRADE WEAPONS — priority for combat runners
  // Determine how many weapon upgrades based on archetype
  const combatArchetypes = ['street-samurai', 'adept', 'infiltrator'];
  const maxWeaponUpgrades = combatArchetypes.includes(archetypeKey) ? 3 : 1;

  let weaponUpgradesDone = 0;
  // Get all weapon items from the items array
  const weaponItems = items.filter((it: any) => it.type === 'feat' && it.system?.featType === 'weapon');

  while (surplus >= 10000 && weaponUpgradesDone < maxWeaponUpgrades && weaponItems.length > 0) {
    // Pick the weapon to upgrade (primary first = bookmarked, then others)
    const target = weaponItems.find((w: any) => w.system.bookmarked) || weaponItems[0];
    const sys = target.system;

    // Determine which upgrade to apply (in priority order)
    let upgraded = false;

    // 1. Add RR for weapon specialization if none yet (+2 levels = 10000¥)
    if (!upgraded && sys.rrList.length === 0 && sys.weaponType) {
      const wt = WEAPON_TYPES[sys.weaponType as keyof typeof WEAPON_TYPES];
      if (wt?.linkedSpecialization) {
        const newRating = computeFeatLevel(sys.featType, { ...sys, rrList: [{ rrType: 'specialization', rrValue: 1, rrTarget: wt.linkedSpecialization, rrLabel: wt.linkedSpecialization }] }).level;
        const newCost = computeFeatCost(sys.featType, { ...sys, rating: newRating, rrList: [{ rrType: 'specialization', rrValue: 1, rrTarget: wt.linkedSpecialization, rrLabel: wt.linkedSpecialization }] });
        const oldCost = computeFeatCost(sys.featType, { ...sys, rating: computeFeatLevel(sys.featType, sys).level });
        if (newCost - oldCost <= surplus) {
          const label = compendiumItems ? resolveRRLabel(compendiumItems, wt.linkedSpecialization, 'specialization') : wt.linkedSpecialization;
          sys.rrList = [{ rrType: 'specialization', rrValue: 1, rrTarget: wt.linkedSpecialization, rrLabel: label }];
          sys.rating = newRating;
          upgraded = true;
        }
      }
    }

    // 2. Add +1 DV bonus (+1 level = 5000¥)
    if (!upgraded && (sys.damageValueBonus || 0) < 2) {
      const newDVB = (sys.damageValueBonus || 0) + 1;
      const newRating = computeFeatLevel(sys.featType, { ...sys, damageValueBonus: newDVB }).level;
      const newCost = computeFeatCost(sys.featType, { ...sys, rating: newRating });
      const oldCost = computeFeatCost(sys.featType, sys);
      if (newCost - oldCost <= surplus) {
        sys.damageValueBonus = newDVB;
        sys.rating = newRating;
        upgraded = true;
      }
    }

    // 3. Improve a range (+2 levels = 10000¥)
    if (!upgraded) {
      const ri = sys.rangeImprovements || { melee: false, short: false, medium: false, long: false };
      const improvableRange = ['short', 'medium', 'long', 'melee'].find(r => !ri[r] && sys[`${r}Range`] === 'disadvantage');
      if (improvableRange) {
        const newRI = { ...ri, [improvableRange]: true };
        const newRating = computeFeatLevel(sys.featType, { ...sys, rangeImprovements: newRI }).level;
        const newCost = computeFeatCost(sys.featType, { ...sys, rating: newRating });
        const oldCost = computeFeatCost(sys.featType, sys);
        if (newCost - oldCost <= surplus) {
          sys.rangeImprovements = newRI;
          sys.rating = newRating;
          upgraded = true;
        }
      }
    }

    // 4. Add a narrative effect (+1 level = 5000¥)
    if (!upgraded) {
      const effects = sys.narrativeEffects || [];
      if (effects.length < 3) {
        const idx = Math.floor(Math.random() * NARRATIVE_EFFECTS_FR.length);
        const english = NARRATIVE_EFFECTS_EN[idx]!;
        const effectText = tableText(NARRATIVE_EFFECTS_FR[idx]!, english, NARRATIVE_EFFECTS_JA[english]);
        const newEffects = [...effects, { text: effectText, isNegative: false, value: 1 }];
        const newRating = computeFeatLevel(sys.featType, { ...sys, narrativeEffects: newEffects }).level;
        const newCost = computeFeatCost(sys.featType, { ...sys, rating: newRating });
        const oldCost = computeFeatCost(sys.featType, sys);
        if (newCost - oldCost <= surplus) {
          sys.narrativeEffects = newEffects;
          sys.rating = newRating;
          upgraded = true;
        }
      }
    }

    if (!upgraded) break; // No more upgrades possible
    weaponUpgradesDone++;
    totalSpent = recomputeTotal();
    surplus = powerLevel.budget - totalSpent;
  }

  // 9c. Add specializations that match existing RR targets (so RR actually works)
  // Then 1 extra random if budget allows
  let addedSpecs = 0;
  const skillSlugsForSpecs = new Set(skillResult.skills.map((s) => s.slug));
  const existingSpecsSet = new Set(specResult.specs);

  // First: find RR targets in feats that point to specs we don't have yet
  // Only add specs whose parent skill the runner actually has at rating >= 2
  const rrTargetSpecs: string[] = [];
  const runnerSkillSlugs = new Set(skillResult.skills.filter(s => s.rating >= 2).map(s => s.slug));
  for (const item of items) {
    if (item.type !== 'feat' || !item.system?.rrList) continue;
    for (const rr of item.system.rrList) {
      if (rr.rrType === 'specialization' && rr.rrTarget && !existingSpecsSet.has(rr.rrTarget)) {
        const specDef = SPEC_DEFINITIONS[rr.rrTarget];
        if (specDef && runnerSkillSlugs.has(specDef.linkedSkill) && !rrTargetSpecs.includes(rr.rrTarget)) {
          rrTargetSpecs.push(rr.rrTarget);
        }
      }
    }
  }

  // Add RR-targeted specs first (priority)
  for (const specSlug of rrTargetSpecs) {
    if (surplus < 2500) break;
    if (existingSpecsSet.has(specSlug)) continue;
    specResult.specs.push(specSlug);
    existingSpecsSet.add(specSlug);
    addedSpecs++;
    const specItem = buildSpecItem(compendiumItems, specSlug, specResult.specs.length + 100);
    if (specItem) items.push(specItem);
    totalSpent = recomputeTotal();
    surplus = powerLevel.budget - totalSpent;
  }

  // Then 1 extra random optional spec if budget allows
  while (surplus >= 10000 && addedSpecs < rrTargetSpecs.length + 1) {
    const available = archetype.optionalSpecs.filter((slug) => {
      const specDef = SPEC_DEFINITIONS[slug];
      return (
        specDef &&
        skillSlugsForSpecs.has(specDef.linkedSkill) &&
        !existingSpecsSet.has(slug)
      );
    });
    if (available.length === 0) break;
    const newSpec = pickOne(available);
    specResult.specs.push(newSpec);
    existingSpecsSet.add(newSpec);
    addedSpecs++;
    const specItem = buildSpecItem(
      compendiumItems,
      newSpec,
      specResult.specs.length + 100,
    );
    if (specItem) items.push(specItem);
    totalSpent = recomputeTotal();
    surplus = powerLevel.budget - totalSpent;
  }

  // 9d. Add contacts with RR to spend remaining budget
  const contactNames = [
    "Informateur",
    "Passeur",
    "Technicien",
    "Avocat véreux",
    "Ex-corpo",
    "Garde du corps",
    "Pilote",
    "Chimiste",
    "Mercenaire",
    "Antiquaire",
    "Tatoueuse",
    "Bookmaker",
    "Politicien",
    "Smuggler",
    "Chaman de quartier",
  ];
  // Labels will be resolved from compendium in buildFeatItem
  const contactRRTargets = [
    { rrType: "specialization", rrTarget: "spec_criminal", rrLabel: "spec_criminal" },
    { rrType: "specialization", rrTarget: "spec_la-rue", rrLabel: "spec_la-rue" },
    { rrType: "specialization", rrTarget: "spec_corporate", rrLabel: "spec_corporate" },
    { rrType: "specialization", rrTarget: "spec_media", rrLabel: "spec_media" },
    {
      rrType: "specialization",
      rrTarget: "spec_government",
      rrLabel: "spec_government",
    },
  ];
  let addedContacts = 0;
  const usedContactNames = new Set(
    items
      .filter((it: any) => it.system?.featType === "contact")
      .map((it: any) => it.name),
  );
  const contactPrefix = game.i18n!.localize('SRA2.NPC_GEN.CONTACT.PREFIX');
  while (surplus >= 15000 && addedContacts < 4) {
    const availableNames = contactNames.filter(
      (n) => !usedContactNames.has(`${contactPrefix} ${n}`),
    );
    if (availableNames.length === 0) break;
    const cName = pickOne(availableNames);
    const cRR = pickOne(contactRRTargets);
    const contactTemplate = feat({
      name: `${contactPrefix} ${cName}`,
      featType: "contact",
      cost: "free-equipment",
      nuyenCost: 0,
      description: game.i18n!.localize('SRA2.NPC_GEN.CONTACT.DESCRIPTION'),
      rrList: [{ ...cRR, rrValue: 1 }],
    });
    const builtItem = buildFeatItem(contactTemplate, items.length + 300, compendiumItems);
    const itemCost = computeFeatCost(
      builtItem.system.featType,
      builtItem.system,
    );
    if (itemCost > surplus) break;
    items.push(builtItem);
    usedContactNames.add(contactTemplate.name);
    addedContacts++;
    totalSpent = recomputeTotal();
    surplus = powerLevel.budget - totalSpent;
  }

  // 9e. Add extra equipment with remaining leftover (exclude foci that don't match archetype skills)
  const spendSkillKeys = { ...archetype.primarySkills, ...archetype.secondarySkills };
  while (surplus >= 5000) {
    const extraPool = EQUIPMENT_TEMPLATES.slice(2).filter(eq => {
      if (!isMagicFocus(eq)) return true;
      if (!archetype.isAwakened) return false;
      if (isSorceryFocus(eq) && !('sorcery' in spendSkillKeys)) return false;
      if (isConjurationFocus(eq) && !('conjuration' in spendSkillKeys)) return false;
      return true;
    });
    const existingNames = new Set(
      items.filter((it: any) => it.type === "feat").map((it: any) => it.name),
    );
    const available = extraPool.filter((f) => !existingNames.has(f.name));
    if (available.length === 0) break;
    const template = pickOne(available);
    const builtItem = buildFeatItem(template, items.length + 400, compendiumItems);
    const itemCost = computeFeatCost(
      builtItem.system.featType,
      builtItem.system,
    );
    if (itemCost > surplus - 2500) break;
    items.push(builtItem);
    totalSpent = recomputeTotal();
    surplus = powerLevel.budget - totalSpent;
  }

  // Final safety: if over budget, remove items until under budget
  // Priority: remove equipment first, then contacts, then specs, then traits
  totalSpent = recomputeTotal();
  const removableTypes = ['equipment', 'contact', 'specialization', 'trait'];
  while (totalSpent > powerLevel.budget) {
    let removed = false;
    for (const removeType of removableTypes) {
      const removable = [...items].reverse().find((it: any) => {
        if (removeType === 'specialization') return it.type === 'specialization';
        if (it.type !== 'feat') return false;
        if (it.system?.featType !== removeType) return false;
        // Never remove commlink or fake SIN
        if (removeType === 'equipment') {
          const n = it.name?.toLowerCase() || '';
          if (n.includes('commlink') || n.includes('sin')) return false;
        }
        return true;
      });
      if (removable) {
        items.splice(items.indexOf(removable), 1);
        removed = true;
        break;
      }
    }
    if (!removed) break;
    totalSpent = recomputeTotal();
  }

  // remainingYens: exclude droneReserve since it's spent on drone actors, not cash
  const remainingYens = Math.max(0, powerLevel.budget - totalSpent);

  // DEBUG: Log generation details
  console.log(`%c=== RUNNER GENERATOR DEBUG: ${name.displayName} ===`, 'color: cyan; font-weight: bold;');
  console.log(`Archetype: ${archLabel} | Metatype: ${mtName} | Level: ${plLabel} (${powerLevel.budget} ¥)`);
  console.log(`Attributes:`, attrResult.attributes, `| Cost: ${attrResult.cost} ¥`);
  console.log(`Skills:`);
  for (const item of items.filter((it: any) => it.type === 'skill')) {
    const r = item.system.rating;
    const cost = r <= 5 ? r * 2500 : 5 * 2500 + (r - 5) * 5000;
    console.log(`  ${item.name} (${item.system.slug}): rating ${r} → ${cost} ¥`);
  }
  console.log(`Specializations: ${items.filter((it: any) => it.type === 'specialization').map((it: any) => it.name).join(', ')} (${items.filter((it: any) => it.type === 'specialization').length} × 2500 ¥)`);
  console.log(`Feats:`);
  for (const item of items.filter((it: any) => it.type === 'feat')) {
    const cost = computeFeatCost(item.system.featType, item.system);
    console.log(`  [${item.system.featType}] ${item.name} | rating: ${item.system.rating} | cost: ${cost} ¥ | rrList: ${JSON.stringify(item.system.rrList)}`);
  }
  const skillsCost = items.filter((it: any) => it.type === 'skill').reduce((s: number, it: any) => { const r = it.system.rating || 0; return s + (r <= 5 ? r * 2500 : 5 * 2500 + (r - 5) * 5000); }, 0);
  const specsCost = items.filter((it: any) => it.type === 'specialization').length * 2500;
  const featsCost = items.filter((it: any) => it.type === 'feat').reduce((s: number, it: any) => s + computeFeatCost(it.system.featType, it.system), 0);
  console.log(`%cBudget breakdown:`, 'font-weight: bold;');
  console.log(`  Attributes: ${attrResult.cost} ¥`);
  console.log(`  Skills: ${skillsCost} ¥`);
  console.log(`  Specializations: ${specsCost} ¥`);
  console.log(`  Feats: ${featsCost} ¥`);
  console.log(`  TOTAL: ${attrResult.cost + skillsCost + specsCost + featsCost} ¥ (recompute: ${totalSpent} ¥)`);
  console.log(`  Budget: ${powerLevel.budget} ¥ | Remaining: ${remainingYens} ¥ | Surplus at end: ${surplus} ¥`);
  console.log(`%c=== END DEBUG ===`, 'color: cyan;');

  // 10. Assemble actor data
  const anarchyBase = 3 + metatype.anarchyBonus;
  const actorData = {
    name: name.displayName,
    type: "character",
    img: metatype.img,
    system: {
      attributes: attrResult.attributes,
      resources: { yens: remainingYens, anarchy: 0 },
      maxEssence: 6,
      armorLevel: 0,
      gender: options.gender || 'random',
      connectionMode: "ar",
      damage: {
        light: [false, false],
        severe: [false],
        incapacitating: false,
      },
      anarchySpent: new Array(anarchyBase).fill(false),
      tempAnarchy: 0,
      tempAnarchySpent: [],
      bio: {
        background: flavor.backgroundHtml,
        notes: (() => {
          const imgPrompt = generateImagePrompt(metatypeKey, archetypeKey, options.gender, flavor.backgroundHtml, items, personality.keywords, personality.behaviors, skillResult.skills);
          console.log('%c=== IMAGE PROMPT ===', 'color: magenta; font-weight: bold;');
          console.log(imgPrompt);
          const promptLabel = game.i18n!.localize('SRA2.NPC_GEN.IMAGE_PROMPT');
          return `<p><strong>${promptLabel} :</strong></p><p><em>${imgPrompt}</em></p>`;
        })(),
        gmDescription: `<p><strong>${game.i18n!.localize("SRA2.NPC_GEN.GM.ARCHETYPE")}</strong> ${archLabel}<br/><strong>${game.i18n!.localize("SRA2.NPC_GEN.GM.LEVEL")}</strong> ${plLabel}<br/><strong>${game.i18n!.localize("SRA2.NPC_GEN.GM.BUDGET_SPENT")}</strong> ${nuyen(totalSpent)} ¥ / ${nuyen(powerLevel.budget)} ¥</p>`,
      },
      keywords: {
        keyword1: personality.keywords[0] ?? "",
        keyword2: personality.keywords[1] ?? "",
        keyword3: personality.keywords[2] ?? "",
        keyword4: personality.keywords[3] ?? "",
        keyword5: personality.keywords[4] ?? "",
      },
      behaviors: {
        behavior1: personality.behaviors[0] ?? "",
        behavior2: personality.behaviors[1] ?? "",
        behavior3: personality.behaviors[2] ?? "",
        behavior4: personality.behaviors[3] ?? "",
      },
      catchphrases: {
        catchphrase1: personality.catchphrases[0] ?? "",
        catchphrase2: personality.catchphrases[1] ?? "",
        catchphrase3: personality.catchphrases[2] ?? "",
        catchphrase4: personality.catchphrases[3] ?? "",
      },
      linkedVehicles: [],
      reference: `${game.i18n!.localize("SRA2.NPC_GEN.REFERENCE")} — ${archLabel} ${mtName}`,
      damageGaugeType: "physical",
    },
  };

  // 11. Reuse the generated folder across name and language changes.
  const folder = await generatedNPCFolder();
  (actorData as any).folder = folder?.id ?? null;

  // 12. Create actor without items first
  const actor = await (Actor as any).create(actorData);
  if (!actor) return;

  // 12. Add items via createEmbeddedDocuments so prepareDerivedData runs properly
  await actor.createEmbeddedDocuments("Item", items);

  // 12b. Create drones for Rigger archetype and link them
  if (archetypeKey === 'rigger') {
    await createRiggerDrones(actor, folder);
  }

  // 13. Send summary whisper to the generating user
  const topSkills = skillResult.skills
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5)
    .map((s) => {
      return `<span style="color:var(--sr-ui-color-active,#0ff);">${skillName(s.slug)}</span> <strong>${s.rating}</strong>`;
    })
    .join(" · ");

  // Upstream hard-codes the French abbreviations here, so an English table
  // read FOR/VOL as well. They are the sheet's own labels, so take them from
  // the locale instead.
  const short = (attr: string) => game.i18n!.localize(`SRA2.ATTRIBUTES.${attr}_SHORT`);
  const attrLabels: Record<string, string> = {
    strength: short("STRENGTH"),
    agility: short("AGILITY"),
    willpower: short("WILLPOWER"),
    logic: short("LOGIC"),
    charisma: short("CHARISMA"),
  };
  const attrSummary = Object.entries(attrResult.attributes)
    .map(([k, v]) => {
      const isMax = v === metatype.maxes[k as keyof typeof metatype.maxes];
      const label = attrLabels[k] ?? k.substring(0, 3).toUpperCase();
      return isMax
        ? `<span style="color:var(--sr-ui-color-active,#0ff);font-weight:bold;">${label} ${v}</span>`
        : `${label} ${v}`;
    })
    .join(" · ");

  const essenceUsed = featResult.essenceSpent;
  const essenceRemaining = 6 - essenceUsed;

  // Read the created items rather than the templates behind them: a template's
  // `name` is the French one, so the summary used to print French gear in
  // every language, and disagree with the sheet it links to.
  const gearNames = (featType: string) =>
    (actor.items as any)
      .filter((i: any) => i.system?.featType === featType)
      .map((i: any) => i.name);

  const weaponNames = gearNames("weapon").join(", ") || "—";

  const cyberNames = gearNames("cyberware")
    .map((n: string) => n.split(" ").slice(0, 2).join(" "))
    .join(", ");

  const chatContent = `
<div style="background:rgba(0,0,0,0.3);border:1px solid var(--sr-ui-border-color,#333);border-radius:6px;padding:10px;font-size:0.9em;">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
    <img src="${metatype.img}" style="width:36px;height:36px;border:1px solid var(--sr-ui-border-color,#555);border-radius:50%;" />
    <div style=" display: flex; flex-direction: column; gap: 5px; ">
      <div style="font-size:1.2em;font-weight:bold;">@UUID[Actor.${actor.id}]{${name.streetName}}</div>
      <div style="opacity:0.9;font-weight: bold;font-size:0.85em;">${name.firstName} ${name.lastName}</div>
    </div>
    <div style="margin-left:auto;text-align:right;font-size:0.9em;opacity:0.6;font-weight:bold;">
      ${mtName}<br/>${archLabel}<br/>${plLabel}
    </div>
  </div>
  <div style="margin:6px 0;">${attrSummary} · <span style="opacity:0.7;">ESS ${essenceRemaining}</span></div>
  <div style="margin:6px 0;">${topSkills}</div>
  ${cyberNames ? `<div style="margin:4px 0;font-size:0.85em;opacity:0.8;">${game.i18n!.localize("SRA2.NPC_GEN.CHAT.CHROME")} : ${cyberNames}</div>` : ""}
  <div style="margin:4px 0;font-size:0.85em;opacity:0.8;">${game.i18n!.localize("SRA2.NPC_GEN.CHAT.WEAPONS")} : ${weaponNames}</div>
  <div style="margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1);font-size:0.85em;">
    <span style="color:var(--sr-ui-color-active,#0ff);">${nuyen(totalSpent)} ¥</span>
    <span style="opacity:0.5;"> / ${nuyen(powerLevel.budget)} ¥</span>
    <span style="float:right;">${game.i18n!.localize("SRA2.NPC_GEN.CHAT.CASH")} : <strong>${nuyen(remainingYens)} ¥</strong></span>
  </div>
</div>`;

  try {
    console.log('%c=== RUNNER CHAT MESSAGE ===', 'color: lime;');
    console.log('Content length:', chatContent.length);
    console.log('User ID:', game.user?.id);
    console.log('Content preview:', chatContent.substring(0, 200));
    const userId = game.user?.id;
    await (ChatMessage as any).create({
      content: chatContent,
      whisper: userId ? [userId] : [],
      speaker: { alias: game.i18n!.localize("SRA2.NPC_GEN.CHAT.SPEAKER") },
    });
  } catch (err) {
    console.warn('Runner Generator: failed to send chat message', err);
  }

  // 14. Open sheet (with slight delay to ensure prepareDerivedData has run on all items)
  setTimeout(() => actor.sheet?.render(true), 300);
}

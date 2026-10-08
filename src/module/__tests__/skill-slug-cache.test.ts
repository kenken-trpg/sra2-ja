import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addDefaultSkillEntries, type SkillMetadata } from '../helpers/skill-slug-cache.js';
import { getPhantomRRs } from '../helpers/sheet-helpers.js';

let names: Record<string, string>;
let metadata: Record<string, SkillMetadata>;
let reverseNames: Record<string, string>;

beforeEach(() => {
  names = {};
  metadata = {};
  reverseNames = {};
  const translations: Record<string, string> = {
    'SRA2.NPC_GEN.SPECS.spec_government': '専門化：政府',
    'SRA2.NPC_GEN.SPECS.spec_unarmed': '専門化：素手戦闘',
  };
  vi.stubGlobal('game', {
    items: [], actors: { get: () => undefined },
    i18n: { lang: 'ja', localize: (key: string) => translations[key] ?? key },
  });
  vi.stubGlobal('SRA2_SKILL_SLUG_CACHE', names);
  vi.stubGlobal('SRA2_SLUG_METADATA_CACHE', metadata);
  vi.stubGlobal('SRA2_NAME_TO_SLUG_CACHE', reverseNames);
});

afterEach(() => vi.unstubAllGlobals());

function actorWithRR(slug: string, skills: any[] = []) {
  return {
    system: { attributes: { strength: 2, agility: 4, charisma: 3 }, linkedVehicles: [] },
    items: [...skills, {
      type: 'feat', name: 'RR source',
      system: { active: true, rrList: [{ rrType: 'specialization', rrTarget: slug, rrValue: 1 }] },
    }],
  };
}

describe('built-in skill entries without compendiums', () => {
  it('resolves a contact RR to Networking + Charisma rather than Strength', () => {
    addDefaultSkillEntries(names, metadata, reverseNames);
    const actor = actorWithRR('spec_government', [{
      type: 'skill', name: 'Networking',
      system: { slug: 'networking', linkedAttribute: 'charisma', rating: 2 },
    }]);
    expect(getPhantomRRs(actor)).toMatchObject([{
      name: '専門化：政府', slug: 'spec_government', linkedSkillName: 'networking',
      linkedAttribute: 'charisma', linkedSkillOnActor: true, totalDicePool: 5, rr: 1,
    }]);
  });

  it('uses the defined attribute even when the linked skill is also unowned', () => {
    addDefaultSkillEntries(names, metadata, reverseNames);
    expect(getPhantomRRs(actorWithRR('spec_unarmed'))).toMatchObject([{
      name: '専門化：素手戦闘', linkedAttribute: 'agility',
      linkedSkillName: 'close-combat', linkedSkillOnActor: false, totalDicePool: 4,
    }]);
  });

  it('preserves existing world/compendium overrides and reverse-name priority', () => {
    names.spec_government = 'GM custom name';
    metadata.spec_government = { linkedSkill: 'custom-skill', linkedAttribute: 'willpower' };
    reverseNames['spec: government'] = 'custom-government';
    addDefaultSkillEntries(names, metadata, reverseNames);
    expect(names.spec_government).toBe('GM custom name');
    expect(metadata.spec_government).toEqual({ linkedSkill: 'custom-skill', linkedAttribute: 'willpower' });
    expect(reverseNames['spec: government']).toBe('custom-government');
    expect(reverseNames['spé : gouvernemental'.normalize('NFD').replace(/[\u0300-\u036f]/g, '')]).toBe('spec_government');
  });
});

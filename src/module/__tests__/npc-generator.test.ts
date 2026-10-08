import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACTOR_ATTRIBUTES } from '../config/constants.js';
import { ARCHETYPES, METATYPES, POWER_LEVELS } from '../config/npc-generator-data.js';
import { generateNPCs } from '../helpers/npc-generator.js';

// Exercise generation and the real item builders/calculations, replacing only
// Foundry persistence, notifications and rendering. No compendium is required.
vi.mock('../helpers/npc-folder.js', () => ({
  generatedNPCFolder: async () => ({ id: 'generated-folder' }),
}));

interface GeneratedActor {
  id: string;
  uuid: string;
  name: string;
  type: string;
  system: Record<string, any>;
  items: any[];
  createEmbeddedDocuments: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
}

let actors: GeneratedActor[];
const metatypes = Object.keys(METATYPES);
const cases = Object.keys(ARCHETYPES).flatMap((archetype, archetypeIndex) =>
  ['ganger', 'runner', 'elite'].map((powerLevel, index) => ({
    archetype,
    powerLevel,
    metatype: metatypes[(archetypeIndex + index) % metatypes.length]!,
    gender: ['male', 'female', 'neutral'][index]!,
    random: [0, 0.5, 1 - Number.EPSILON][index]!,
  })),
);

beforeEach(() => {
  actors = [];
  vi.useFakeTimers();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.stubGlobal('game', {
    i18n: { lang: 'en', localize: (key: string) => key },
    packs: [],
    user: { id: 'test-user' },
  });
  vi.stubGlobal('ui', { notifications: { error: vi.fn() } });
  vi.stubGlobal('ChatMessage', { create: vi.fn().mockResolvedValue({}) });
  vi.stubGlobal('Actor', {
    create: vi.fn(async (data: any) => {
      const id = `actor-${actors.length}`;
      const actor: GeneratedActor = {
        ...data,
        id,
        uuid: `Actor.${id}`,
        items: [],
        createEmbeddedDocuments: vi.fn(async (_type: string, items: any[]) => {
          actor.items.push(...items);
        }),
        update: vi.fn(async (updates: Record<string, unknown>) => {
          if ('system.linkedVehicles' in updates) {
            actor.system.linkedVehicles = updates['system.linkedVehicles'];
          }
        }),
      };
      actors.push(actor);
      return actor;
    }),
  });
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('NPC generation after strict type fixes', () => {
  it.each(cases)('generates $powerLevel $archetype ($metatype, $gender)', async ({ random, ...selection }) => {
    vi.spyOn(Math, 'random').mockReturnValue(random);
    expect(await generateNPCs({ ...selection, count: 1 })).toBe(1);
    const actor = actors[0]!;
    expect(actor.type).toBe('character');
    expect(actor.name).not.toMatch(/undefined|NaN/);
    expect(actor.name).toMatch(/\S+ \(\S+ \S+\)/);
    const metatype = METATYPES[selection.metatype]!;
    const level = POWER_LEVELS[selection.powerLevel]!;
    for (const attribute of ACTOR_ATTRIBUTES) {
      expect(actor.system.attributes[attribute]).toBeGreaterThanOrEqual(2);
      expect(actor.system.attributes[attribute]).toBeLessThanOrEqual(metatype.maxes[attribute]);
    }
    expect(Number.isFinite(actor.system.resources.yens)).toBe(true);
    expect(actor.system.resources.yens).toBeGreaterThanOrEqual(0);
    expect(actor.items.some((item) => item.type === 'metatype')).toBe(true);
    for (const item of actor.items) {
      expect(item.name).toBeTruthy();
      expect(item.name).not.toMatch(/undefined|NaN/);
      if (item.type === 'skill') {
        expect(item.system.rating).toBeGreaterThanOrEqual(1);
        expect(item.system.rating).toBeLessThanOrEqual(level.skillMax);
      }
      if (item.type === 'specialization') {
        expect(actor.items.some((skill) =>
          skill.type === 'skill' && skill.system.slug === item.system.linkedSkill,
        ), `Missing parent skill for ${item.system.slug}`).toBe(true);
      }
    }
    if (selection.archetype === 'rigger') {
      expect(actors.filter((created) => created.type === 'vehicle')).toHaveLength(2);
      expect(actor.system.linkedVehicles).toHaveLength(2);
    }
    if (ARCHETYPES[selection.archetype]?.isAwakened) {
      expect(actor.items.some((item) => item.system.featType === 'awakened')).toBe(true);
    }
    if (ARCHETYPES[selection.archetype]?.isEmerged) {
      expect(actor.items.some((item) => item.system.featType === 'emerged')).toBe(true);
    }
  });

  it('falls back to runner for an unknown power level and supports random selections', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(await generateNPCs({ powerLevel: 'unknown', archetype: 'random', metatype: 'random', gender: 'random', count: 1 })).toBe(1);
    expect(actors[0]?.type).toBe('character');
    expect(actors[0]?.system.gender).toBe('female');
    expect(actors[0]?.system.bio.gmDescription).toContain(`${POWER_LEVELS.runner.budget.toLocaleString('en')} ¥`);
  });
});

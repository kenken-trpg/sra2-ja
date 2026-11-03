/**
 * Data made under upstream `sra2` (a Bulk Tasks export, an upstream compendium)
 * points its images at systems/sra2/. Under this fork's own system id those
 * images are broken unless the path is rewritten on load and on create.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  rewriteActorSource,
  rewriteItemSource,
  rewriteUpstreamPath,
} from '../helpers/upstream-paths.js';

describe('rewriteUpstreamPath', () => {
  it.each([
    ['systems/sra2/icons/status/dazed.svg', 'systems/sra2-ja/icons/status/dazed.svg'],
    ['systems/sra2/icons/magic/Mage_Manabolt.svg', 'systems/sra2-ja/icons/magic/Mage_Manabolt.svg'],
    ['/systems/sra2/icons/status/confused.svg', '/systems/sra2-ja/icons/status/confused.svg'],
  ])('moves %s under this system', (from, to) => {
    expect(rewriteUpstreamPath(from)).toBe(to);
  });

  it.each([
    'systems/sra2-ja/icons/status/dazed.svg', // already ours
    'systems/sra2-other/icons/x.svg', // a different system that only shares the prefix
    'icons/svg/item-bag.svg', // core Foundry icon
    'modules/some-module/sra2/icon.svg',
    'https://example.com/systems/sra2/icon.svg',
    '',
  ])('leaves %s alone', (path) => {
    expect(rewriteUpstreamPath(path)).toBe(path);
  });

  it('passes non-strings through', () => {
    expect(rewriteUpstreamPath(null)).toBeNull();
    expect(rewriteUpstreamPath(undefined)).toBeUndefined();
  });
});

describe('document sources', () => {
  it('rewrites an item and its effects', () => {
    const item = rewriteItemSource({
      name: 'クラッキング / Cracking',
      img: 'systems/sra2/icons/gameicons/skills/hacking.svg',
      effects: [{ img: 'systems/sra2/icons/status/dazed.svg' }, { icon: 'systems/sra2/icons/status/frightened.svg' }],
    });
    expect(item.img).toBe('systems/sra2-ja/icons/gameicons/skills/hacking.svg');
    expect(item.effects[0].img).toBe('systems/sra2-ja/icons/status/dazed.svg');
    expect(item.effects[1].icon).toBe('systems/sra2-ja/icons/status/frightened.svg');
  });

  it('rewrites an actor, its prototype token and its embedded items', () => {
    const actor = rewriteActorSource({
      img: 'systems/sra2/actors/generic_tokens/metatypes/Elf.webp',
      prototypeToken: { texture: { src: 'systems/sra2/actors/generic_tokens/metatypes/Elf.webp' } },
      items: [{ img: 'systems/sra2/icons/weapons/Ares-viper-Silvergun.svg' }, { img: 'icons/svg/item-bag.svg' }],
    });
    expect(actor.img).toBe('systems/sra2-ja/actors/generic_tokens/metatypes/Elf.webp');
    expect(actor.prototypeToken.texture.src).toBe('systems/sra2-ja/actors/generic_tokens/metatypes/Elf.webp');
    expect(actor.items[0].img).toBe('systems/sra2-ja/icons/weapons/Ares-viper-Silvergun.svg');
    expect(actor.items[1].img).toBe('icons/svg/item-bag.svg');
  });

  it('does not add fields a partial update did not carry', () => {
    // migrateData also sees partial sources; it must not invent `img`.
    const partial = rewriteItemSource({ name: 'x' });
    expect(partial).toEqual({ name: 'x' });
    expect(rewriteActorSource({ system: {} })).toEqual({ system: {} });
  });
});

describe('wired into the document classes', () => {
  let SRA2Item: any;
  let SRA2Actor: any;

  beforeAll(async () => {
    // The base classes only need a migrateData for the subclasses to call.
    class Base {
      static migrateData(source: any) {
        return source;
      }
    }
    vi.stubGlobal('Item', Base);
    vi.stubGlobal('Actor', Base);
    ({ SRA2Item } = await import('../documents/item.js'));
    ({ SRA2Actor } = await import('../documents/actor.js'));
  });

  it('SRA2Item.migrateData rewrites the image', () => {
    const out = SRA2Item.migrateData({ type: 'skill', img: 'systems/sra2/icons/status/dazed.svg' });
    expect(out.img).toBe('systems/sra2-ja/icons/status/dazed.svg');
  });

  it('SRA2Actor.migrateData rewrites the embedded items too', () => {
    const out = SRA2Actor.migrateData({ items: [{ type: 'race', img: 'systems/sra2/icons/status/dazed.svg' }] });
    expect(out.items[0]).toEqual({ type: 'metatype', img: 'systems/sra2-ja/icons/status/dazed.svg' });
  });
});

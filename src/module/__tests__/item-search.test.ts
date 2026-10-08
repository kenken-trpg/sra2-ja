import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { addItemToActorFromUuid, buildSearchResultsHtml } from '../helpers/item-search.js';

const ja = JSON.parse(readFileSync('public/lang/ja.json', 'utf8'));
const localize = (key: string): string => key.split('.').reduce((v, part) => v?.[part], ja) ?? key;
const format = (key: string, values: Record<string, string>): string =>
  localize(key).replace(/\{(\w+)\}/g, (_match, name: string) => values[name] ?? `{${name}}`);
const notifications = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };

beforeEach(() => {
  vi.stubGlobal('game', { i18n: { localize, format } });
  vi.stubGlobal('ui', { notifications });
});
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('item search labels and notifications', () => {
  it('renders an add label and a fully formatted duplicate label', () => {
    const html = buildSearchResultsHtml({
      results: [
        { name: '隠密', uuid: 'Item.a', source: 'World', type: 'skill', alreadyExists: true },
        { name: '近接戦闘', uuid: 'Item.b', source: 'World', type: 'skill' },
      ],
      lastSearchTerm: '', noResultsMessage: 'なし', typeLabel: '技能',
    });
    expect(html).toContain('追加');
    expect(html).toContain('隠密 はこのキャラクターに既に存在します');
    expect(html).not.toMatch(/SRA2\.|\{name\}/);
  });

  it('reports a missing document in Japanese', async () => {
    vi.stubGlobal('fromUuid', vi.fn(async () => null));
    expect(await addItemToActorFromUuid({}, 'Item.missing')).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith('アイテムが見つかりません');
  });

  it('does not create a duplicate, and names the existing item', async () => {
    vi.stubGlobal('fromUuid', vi.fn(async () => ({ name: '隠密', type: 'skill' })));
    const actor = { items: [{ name: '隠密', type: 'skill' }], createEmbeddedDocuments: vi.fn() };
    expect(await addItemToActorFromUuid(actor, 'Item.a')).toBe(false);
    expect(actor.createEmbeddedDocuments).not.toHaveBeenCalled();
    expect(notifications.warn).toHaveBeenCalledWith('隠密 はこのキャラクターに既に存在します');
  });

  it('adds the document and formats its success notification', async () => {
    const data = { name: '隠密', type: 'skill' };
    vi.stubGlobal('fromUuid', vi.fn(async () => ({ ...data, toObject: () => data })));
    const actor = { items: [], createEmbeddedDocuments: vi.fn(async () => []) };
    expect(await addItemToActorFromUuid(actor, 'Item.a')).toBe(true);
    expect(actor.createEmbeddedDocuments).toHaveBeenCalledWith('Item', [data]);
    expect(notifications.info).toHaveBeenCalledWith('隠密 を追加しました');
  });

  it('reports a failed write without claiming the item was added', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('fromUuid', vi.fn(async () => ({ name: '隠密', type: 'skill', toObject: () => ({}) })));
    const actor = { items: [], createEmbeddedDocuments: vi.fn(async () => { throw new Error('failed'); }) };
    expect(await addItemToActorFromUuid(actor, 'Item.a')).toBe(false);
    expect(notifications.error).toHaveBeenCalledWith('アイテムを追加できませんでした');
    expect(notifications.info).not.toHaveBeenCalled();
  });
});

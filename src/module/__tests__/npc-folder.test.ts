import { afterEach, describe, expect, it, vi } from 'vitest';
import { generatedNPCFolder, GENERATED_NPC_FOLDER_FLAG } from '../helpers/npc-folder.js';

afterEach(() => vi.unstubAllGlobals());

function folder(name: string, flagged = false, type = 'Actor') {
  return { name, type, getFlag: vi.fn(() => flagged), setFlag: vi.fn(async () => undefined) };
}

function world(folders: any[], name = '生成済み') {
  vi.stubGlobal('game', { folders, i18n: { localize: () => name } });
  const create = vi.fn(async (data: any) => data);
  vi.stubGlobal('Folder', { create });
  return create;
}

describe('generated NPC folder', () => {
  it('keeps a renamed, flagged Actor folder across language changes', async () => {
    const existing = folder('My runners', true);
    const create = world([folder('Items', true, 'Item'), existing], 'Généré');
    expect(await generatedNPCFolder()).toBe(existing);
    expect(existing.setFlag).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it.each(['Generated', 'Généré', '生成済み'])('adopts legacy %s without renaming it', async (name) => {
    const existing = folder(name);
    const create = world([existing], 'Generated');
    expect(await generatedNPCFolder()).toBe(existing);
    expect(existing.setFlag).toHaveBeenCalledWith('sra2-ja', GENERATED_NPC_FOLDER_FLAG, true);
    expect(create).not.toHaveBeenCalled();
  });

  it('creates a flagged folder and leaves unrelated folders alone', async () => {
    const create = world([folder('My NPCs')]);
    const created = await generatedNPCFolder();
    expect(create).toHaveBeenCalledOnce();
    expect(created).toMatchObject({ name: '生成済み', type: 'Actor', flags: { 'sra2-ja': { generatedNPCs: true } } });
  });
});

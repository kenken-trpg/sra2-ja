import { SYSTEM } from '../config/system.js';

export const GENERATED_NPC_FOLDER_FLAG = 'generatedNPCs';

/** Adopt legacy folders once, then find them independently of name/language. */
export async function generatedNPCFolder(): Promise<any> {
  const folders = Array.from(game.folders ?? []) as any[];
  const actors = folders.filter((folder) => folder.type === 'Actor');
  const flagged = actors.find((folder) => folder.getFlag(SYSTEM.id, GENERATED_NPC_FOLDER_FLAG));
  if (flagged) return flagged;

  const key = 'SRA2.NPC_GENERATOR.FOLDER';
  const translated = game.i18n?.localize(key);
  const name = translated && translated !== key ? translated : 'Generated';
  // Include every shipped translation when adopting an unflagged folder.
  // This also handles a world whose language changed before this update.
  const legacyNames = new Set([name, 'Generated', 'Généré', '生成済み']);
  const legacy = actors.find((folder) => legacyNames.has(folder.name));
  if (legacy) {
    await legacy.setFlag(SYSTEM.id, GENERATED_NPC_FOLDER_FLAG, true);
    return legacy;
  }
  return (Folder as any).create({
    name,
    type: 'Actor',
    sorting: 'a',
    flags: { [SYSTEM.id]: { [GENERATED_NPC_FOLDER_FLAG]: true } },
  });
}

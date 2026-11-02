# PR 04: 生成 NPC フォルダを名前ではなく flag で探す

- 元の項目: upstream-reports.md §15
- 状態: 未投稿
- 本フォークとの違い:
  - flag のスコープは `SYSTEM.id`。本フォークでは `sra2-ja`、上流では `sra2` になる
    （コードは同じ）。
  - 既存フォルダの移行候補から `生成済み` を除き、`Generated` / `Généré` だけにする。
  - 本フォークのキーは `SRA2.NPC_GENERATOR.FOLDER`。上流にもそのまま置ける。
- 変更ファイル: 新規 `src/module/helpers/npc-folder.ts`、`src/module/helpers/npc-generator.ts`、
  `public/lang/en.json`、`public/lang/fr.json`
- **上流は今フォルダ名を翻訳していない**ので、「今壊れている」話ではない。
  「翻訳できるようにすると壊れるので、その前に直す」という提案。差分の割に
  得るものが小さいため、出すのは最後でよい。上流が不要と言えば取り下げる。
- `## Testing` は上流から切ったブランチで実際に確かめてからチェックを付ける（未実施）。

---

**Title:** fix(npc-generator): find the "Generated" folder by flag, not by name

## Problem

Generated NPCs go into an Actor folder called `Generated` (`src/module/helpers/npc-generator.ts:1886`). The same literal is both the folder's name and the lookup key:

```ts
let folder = game.folders?.find((f) => f.type === "Actor" && f.name === "Generated");
if (!folder) folder = await Folder.create({ name: "Generated", … });
```

So the name can't be localized: as soon as it is, every world that already has a `Generated` folder gets a second one. Renaming the folder by hand has the same effect today.

## Fix

A small helper, `generatedNPCFolder()` in `src/module/helpers/npc-folder.ts`:

1. Return the Actor folder that has the flag `sra2.generatedNPCs`, if any.
2. Otherwise, adopt an existing unflagged folder named `Generated` or `Généré` (or the current translation) by setting the flag on it, and return it.
3. Otherwise, create a new folder named from `SRA2.NPC_GENERATOR.FOLDER` (en `Generated`, fr `Généré`), with the flag already set.

After the first run every world has a flagged folder, and the name no longer matters — users can rename it, and changing the client language doesn't split it.

The one case this can't recover: a folder that was renamed by hand **before** this change. It has no flag and no known name, so a new folder is created once.

## Testing

- [ ] Existing world with a `Generated` folder: the next generated NPC goes into it, and the folder gets the flag.
- [ ] Renamed the flagged folder, then generated again: same folder.
- [ ] Fresh world in fr: a `Généré` folder is created.
- [ ] `npm test` passes.

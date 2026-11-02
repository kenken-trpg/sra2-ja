# PR 05: 追跡されている生成物の削除と、未使用 `label` の削除

- 元の項目: upstream-reports.md §10 §11
- 状態: 未投稿
- 本フォークとの違い: なし。削除のみ。
- 変更: 削除 8 ファイル、`src/module/helpers/npc-generator.ts`（`label` を消すだけ）
- LevelDB の再現確認は `classic-level` で行った（upstream-reports.md §11）。
- `packs.tgz` は作者がパック配布に使っている可能性がある。消す前に聞く形にしてある。
- `## Testing` は上流から切ったブランチで実際に確かめてからチェックを付ける（未実施）。

---

**Title:** chore: untrack the broken LevelDB leftovers and an unused field

Two clean-ups, no behaviour change.

## 1. Tracked LevelDB leftovers under `public/packs/`

`.gitignore` ignores `/public/packs`, but these files are still tracked:

```
public/packs/anarchy-items-en/{CURRENT,LOCK,LOG}
public/packs/anarchy-items-fr/{CURRENT,LOCK,LOG}
public/packs/packs.tgz
src/module/config/complication-data.ts.bak
```

`CURRENT` points at `MANIFEST-000024`, which is not committed, so a fresh clone has a LevelDB that **can't be opened**. With `classic-level` (what Foundry uses):

```
committed state → IO error: …/MANIFEST-000024: No such file or directory
empty directory → created fresh, opens fine
no directory    → created fresh, opens fine
```

So the committed files are worse than having nothing. This PR removes them from the index (`git rm --cached` for the pack directories, plain delete for the `.bak`).

**Question:** is `packs.tgz` something you use for distributing the packs? If so I'll drop it from this PR.

## 2. Unused `label` in the cyberdeck program table

`src/module/helpers/npc-generator.ts:1445` builds a table of `{ field, label }`, but only `field` is ever read:

```ts
const programs = [
  { field: 'cyberdeckBiofeedback', label: 'Biofeedback' },
  …
];
```

The `label`s are never shown, but they look like UI strings to anyone auditing for untranslated text. This removes them and leaves a list of fields. If you meant to display them, the cyberdeck feat's existing locale keys would be the place to read them from.

## Testing

- [ ] `npm run build` and `npm test` pass.
- [ ] Fresh clone: Foundry creates the packs normally.

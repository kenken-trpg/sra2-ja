# PR 01: アイテム検索の未定義ロケールキー

- 元の項目: upstream-reports.md §1
- 状態: 未投稿
- 本フォークとの違い:
  - 本フォークは `item-search.ts` を `src/module/helpers/` へ移したが、上流向けには
    **移動しない**（差分が大きくなり、テスト 5 本の `vi.mock` パスも変わる）。
  - キーは本フォークと同じ `SRA2.ITEM_SEARCH.*`（en / fr の値も同じ）。
- 変更ファイル: `item-search.ts`、`public/lang/en.json`、`public/lang/fr.json`
- 仏語の新規文言は仮。PR 本文で確認を依頼している。
- `## Testing` は上流から切ったブランチで実際に確かめてからチェックを付ける（未実施）。

---

**Title:** fix(item-search): define the five locale keys the search results use

## Problem

The item search on the character sheet shows raw locale keys instead of text. For example, the add button on every search result reads `SRA2.SKILLS.ADD`.

`item-search.ts` uses five keys that exist in neither `en.json` nor `fr.json`:

| Key | Where |
| --- | --- |
| `SRA2.SKILLS.ADD` | add button on each result (`:294`) |
| `SRA2.SKILLS.ITEM_NOT_FOUND` | notification (`:353`) |
| `SRA2.ALREADY_EXISTS` | notification (`:359`) |
| `SRA2.SKILLS.ADDED` | notification (`:365`) |
| `SRA2.SKILLS.ERROR_ADDING` | notification (`:370`) |

Foundry returns an undefined key unchanged, so there is no error — the key just appears in the UI. All five are in the built `public/index.mjs`, so this is live code, reached from `character-sheet-v2.ts`.

## Fix

The search is not limited to skills (it adds feats, specializations and so on), so instead of adding more keys under `SKILLS`, the five strings go into a new `SRA2.ITEM_SEARCH` section:

```json
"ITEM_SEARCH": {
    "ADD": "Add",
    "ITEM_NOT_FOUND": "Item not found",
    "ALREADY_EXISTS": "{name} is already on this character",
    "ADDED": "{name} has been added",
    "ERROR_ADDING": "Could not add the item"
}
```

`ALREADY_EXISTS` keeps the wording of the existing `SRA2.SKILLS.ALREADY_EXISTS`.

A related one-liner: the "already on this character" label at `:286` uses `SRA2.SKILLS.ALREADY_EXISTS` with `localize()`, but the string has a `{name}` placeholder, so the result list shows `{name} is already on this character` literally. It now uses `format()` with the result's name and the same `ITEM_SEARCH.ALREADY_EXISTS` key as the notification.

**The French values are my own, please check them:**

```json
"ITEM_SEARCH": {
    "ADD": "Ajouter",
    "ITEM_NOT_FOUND": "Objet introuvable",
    "ALREADY_EXISTS": "{name} est déjà sur ce personnage",
    "ADDED": "{name} a été ajouté",
    "ERROR_ADDING": "Impossible d’ajouter l’objet"
}
```

## Testing

- [ ] `npm run build`, then searched for an item on a character sheet: the button reads *Add* / *Ajouter*, and adding, re-adding and a failed lookup each show a translated notification.
- [ ] `npm test` passes.

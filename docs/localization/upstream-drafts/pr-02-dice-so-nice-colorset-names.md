# PR 02: Dice So Nice のカラーセット名を翻訳可能に

- 元の項目: upstream-reports.md §9
- 状態: 未投稿
- 本フォークとの違い: なし。`src/module/helpers/dice-so-nice.ts` の修正と
  `SRA2.DICE_SO_NICE.*` をそのまま持ち込める（`ja.json` 分だけ除く）。
- 変更ファイル: `src/module/helpers/dice-so-nice.ts`、`public/lang/en.json`、`public/lang/fr.json`
- 仏語の新規文言は仮。
- `## Testing` は上流から切ったブランチで実際に確かめてからチェックを付ける（未実施）。

---

**Title:** fix(dice-so-nice): localize the colorset names

## Problem

The two Dice So Nice colorsets registered by the system have hard-coded English descriptions (`src/module/helpers/dice-so-nice.ts:23`, `:36`):

```ts
dice3d.addColorset({ name: SRA2_NORMAL_COLORSET, description: 'SRA2 - Normal dice', … });
dice3d.addColorset({ name: SRA2_RISK_COLORSET,   description: 'SRA2 - Risk dice',   … });
```

Dice So Nice shows `description` in its colorset picker, so these are visible strings, and they stay in English in a French client.

## Fix

Two new keys, read with `game.i18n.localize()` in `registerDiceSoNice()`:

```json
"DICE_SO_NICE": { "NORMAL": "SRA2 - Normal dice", "RISK": "SRA2 - Risk dice" }
```

`registerDiceSoNice()` runs from the `diceSoNiceReady` hook, which fires after i18n is initialized, so resolving the strings at registration time is safe.

**The English values are the current strings, so English is unchanged.** The French values are my own, please check them:

```json
"DICE_SO_NICE": { "NORMAL": "SRA2 - Dés normaux", "RISK": "SRA2 - Dés de risque" }
```

## Testing

- [ ] With Dice So Nice enabled, the colorset picker shows the names in the client language (en / fr).
- [ ] `npm test` passes.

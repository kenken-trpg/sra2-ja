# Issue 02: `ICE` の表記と、使われないテンプレートのパス（相談）

- 元の項目: upstream-reports.md §7 §8
- 状態: 未投稿
- **§7 は用語・公式表記に関わるため、投稿前に人間が文面を確認する。**
  誤りの指摘ではなく、表記を揃えるかどうかの質問として書いた。
  不要と判断したら §7 の節を削って §8 だけで出す。
- §8 は本フォークでも直していない（実害がないため）。

---

**Title:** Question: `ICE` vs `IC` in en.json, and an unused template path in `character-sheet.ts`

Two small things, neither of them a bug in practice — just questions.

### `ICE` in the English strings

`en.json` uses `ICE` / `ICEs` in about 20 values. The French side consistently uses *Glace*.

The core book's glossary defines *glace* as the abbreviation *CI* (*contre-mesures d'intrusion*) and gives *IC* as the English form, with *ice* as its colloquial form. So `ICE` isn't wrong — just the informal spelling. Do you want the English strings to follow the glossary (`IC`), or is `ICE` the intended choice? Either is fine; I only ask because translations that fall back to English inherit it.

### Unused template path

`src/module/applications/character-sheet.ts:22` sets

```ts
template: 'systems/sra2/templates/actor-character-sheet.hbs',
```

but that file doesn't exist (only `actor-character-sheet-v2.hbs` does). Nothing breaks, because only `CharacterSheetV2` is registered and it overrides `template`. It would only fail if the base class were ever registered directly. Should the path point at the v2 template, or be removed?

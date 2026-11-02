# PR 03: NPC 生成チャットの言語

- 元の項目: upstream-reports.md §16 §17 §18
- 状態: 未投稿
- 本フォークとの違い:
  - 本フォークのキーは `SRA2.NPC_GEN.CHAT.*`（フォークで新設した名前空間）。上流には
    `NPC_GEN` が無いので、既存の `SRA2.NPC_GENERATOR` の下に `CHAT` を置く。
  - 本フォークは金額の区切りを `game.i18n.lang` にし、話者名（`speaker.alias`）も
    キー化した。上流向けにはこの 2 つを**含めない**（上流は en / fr の二択で正しく
    動いており、変える理由が本フォーク側にしかない）。
- 変更ファイル: `src/module/helpers/npc-generator.ts`、`public/lang/en.json`、`public/lang/fr.json`
- `#148`（ダイアログの言語）と同じファイルを触る。#148 が先にマージされた場合は
  rebase して衝突が無いか確認する。
- `## Testing` は上流から切ったブランチで実際に確かめてからチェックを付ける（未実施）。

---

**Title:** fix(npc-generator): show the chat summary in the active language

## Problem

With the client in English, the chat card posted after generating an NPC is partly French — the attributes read `FOR … · VOL …`, and the gear line reads, for example:

```
Armes : Tonfas Meridian Guardian, Bolas Meridian Tangle
```

Three separate causes, all in `src/module/helpers/npc-generator.ts`:

1. **Attribute abbreviations** (`:1921`) are hard-coded in French: `strength: "FOR"`, `willpower: "VOL"`. The sheet itself already has `SRA2.ATTRIBUTES.WILLPOWER_SHORT` (`WIL` / `VOL`).
2. **`Armes :`** (`:1967`) is hard-coded. (`Chrome :` and `Cash :` are too, but they happen to be the same word in both languages.)
3. **Gear names** (`:1941`, `:1947`) come from the templates, whose `name` is the French one. The created items do get the right name — `buildFeatItem()` picks `nameEn` in English — but the summary reads the templates instead of the items. So the same NPC's gear has one name on the sheet and another in the chat.

## Fix

1. Read the abbreviations from `SRA2.ATTRIBUTES.*_SHORT`. `WILLPOWER_SHORT` already exists; this adds `STRENGTH_SHORT`, `AGILITY_SHORT`, `LOGIC_SHORT` and `CHARISMA_SHORT` next to it — en `STR` / `AGI` / `LOG` / `CHA`, fr `FOR` / `AGI` / `LOG` / `CHA`, i.e. **French is unchanged**.
2. Add `SRA2.NPC_GENERATOR.CHAT.{CHROME,WEAPONS,CASH}`: en `Chrome` / `Weapons` / `Cash`, fr `Chrome` / `Armes` / `Cash`.
3. Build the weapon and cyberware lists from `actor.items`, which at that point are the items just created by `createEmbeddedDocuments`, so the chat and the sheet show the same names. The existing "first two words" shortening for cyberware is kept as is.

Nothing changes in French. In English, the summary becomes `STR 4 · AGI 5 · WIL 3 …`, `Weapons : …`, and the gear names match the sheet.

## Testing

- [ ] Generated several NPCs in en and fr; the chat summary matches the sheet in both.
- [ ] `npm test` passes.

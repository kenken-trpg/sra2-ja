# Issue 01: データとロケールの不整合（まとめて 1 件）

- 元の項目: upstream-reports.md §2 §3 §4 §5 §6 §12 §13 §14
- 状態: 未投稿
- 本フォークでの対応: どれも直していない（上流のデータで、直すと追従が難しくなる）
- メモ:
  - §14 は upstream-reports.md では `en.json` としていたが、実際は Compendium 翻訳
    `public/lang/en/sra2.anarchy-objets.json:2379`。本文はこちらで書いた。
  - §3 の件数はフランス語の機能語による推定。本文でも推定と明記した。
  - 原書（仏語版基本ルールブック）の語を根拠にしている箇所は、語そのものだけを
    引用し、本文の文章は引用しない（translation-rules.md §11）。
  - §5 の `Proxénète : Velvet` は質問として出す。

---

**Title:** Data inconsistencies found while localizing (manifest, compendium translations, NPC generator, vehicle labels)

While working on a Japanese localization of this system, I went through the data and locale files and found a handful of inconsistencies. None of them is fixed here — I am reporting them so you can decide what is intended. Line numbers are against `be3672c` (v14.3.3).

Where I say "the core book", I mean the French core rulebook; I only compared the terms, not any text.

### 1. The manifest's cover image does not exist

`public/system.json:112` points `media[0].url` at `systems/sra2/style/sra2-logo.webp`, but there is no file named `sra2-logo*` anywhere in the repository, so the cover is broken in Foundry's package list. The closest existing file is `public/img/interface/sra2/sra2_logo.svg` — I don't know whether that is the intended one.

### 2. French text left in the English compendium translations

Several values in `public/lang/en/` are still in French. Counts are an estimate (I searched for French function words), but the examples are unambiguous:

| File | Entries | French `name` | French `description` |
| --- | --- | --- | --- |
| `sra2.anarchy-acteurs.json` | 160 | ~33 | 0 |
| `sra2.anarchy-objets.json` | 559 | ~14 | ~145 |
| `sra2.sra2-skills.json` | 15 | 0 | 0 |

```json
{ "id": "Anti-magie",      "name": "Anti-Magic",      "description": "<p>Seulement sur les défenses contre les sortilèges.</p>" }
{ "id": "Ares Antioch II", "name": "Ares Antioch II", "description": "<p>Lance-grenade. Dégats de zone</p>" }
```

Some names are half-translated, e.g. `"Armure mystique"` → `"Armor mystique"`.

One case outside descriptions: `sra2.anarchy-objets.json:2379` translates `"Spé : La rue"` to `"Spec: La rue"`. The core book's specialization is *la rue*, so `"Spec: Street"` looks right.

### 3. Duplicate `id`s in `sra2.anarchy-objets.json`

Six `id`s appear twice, so only one of each pair can ever be reached:

| `id` | Effect |
| --- | --- |
| `Démarqueur` | only one of the two has a `description` → the translation may be lost |
| `Guérison rapide` | same |
| `Marqueurs furtifs` | same |
| `Armure` | both entries are identical |
| `Armure mystique` | both entries are identical |
| `Frappe à distance` | both entries are identical |

### 4. NPC generator: French and English names that describe different items

In `src/module/config/npc-generator-data.ts`, four entries have a `name` and `nameEn` that do not match, so switching languages shows a different item:

| Line | `name` | `nameEn` | Notes |
| --- | --- | --- | --- |
| 1131 | `Lame monofilament Whisper` (blade) | `Whisper Monofilament Whip` (whip) | The French description says *Fouet* (whip), and the core book has *fouet monofilament* but no *lame monofilament*. The French name looks wrong. |
| 1338 | `Grenades fumigènes Meridian Haze` (smoke) | `Meridian Haze Gas Grenades` (gas) | `weaponType: 'gas-grenades'` and the description is tear gas. The real smoke grenade is a separate entry at line 2096 (`HazeCloud`). The French name looks wrong. |
| 2368 | `Blouson de moto SteetHide` | `StreetHide Biker Jacket` | Typo: `SteetHide`. |
| 2655 | `Proxénète : Velvet` | `Fixer: Velvet` | **Question:** these are different jobs. The table already has `Recruteur du milieu : Broker` as the fixer-like contact, so I suspect the French is intended and the English should change — but I can't tell from outside. Which one did you mean? |

### 5. One vehicle type with two names (twice)

The vehicle-type label and the vehicle template disagree:

| Key | en | fr |
| --- | --- | --- |
| type label `bus-truck` (`en.json:156`, `fr.json:156`) | `Bus / Truck` | `Bus / Camion` |
| template `BUS_TRUCK` (`en.json:876`, `fr.json:743`) | `Bus / Semi-trailer (…)` | `Bus / Semi-remorque (…)` |
| type label `glider-wing` (`en.json:162`, `fr.json:162`) | `Glider Wing` | `Aile planante` |
| template `GLIDER_WING` (`en.json:882`, `fr.json:749`) | `Glider wing (…)` | `Aile volante (…)` |

The core book uses *bus / semi-remorque* and *aile volante*, so the type labels seem to be the ones that drifted. (`Glider Wing` in English is fine either way; only the French label differs.)

### 6. Spelling: `Bâteau`

`fr.json:744` (`RIGID_INFLATABLE_BOAT`) reads `Bâteau pneumatique semi-rigide`. The word is *bateau*, without the circumflex (the core book spells it that way too).

---

I'm happy to send PRs for any of these once you tell me which way you want them.

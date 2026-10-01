# 上流への報告候補

日本語化の作業中に見つかった**上流（`VincentVk9373/sra2`）側の問題**の一覧。
本フォークでは直していない（直すと追従が難しくなる）ものと、フォーク内では
回避したが上流にも伝えるべきものを、報告できる形まで固めて置いておく。

**この一覧は下書きである。** Issue / PR を実際に出すかどうかは人間が決める。
出す場合も、ライセンス・権利に触れる項目（§7）は本文をそのまま使わず、
人間が内容を確認してから投稿する。

確認は上流の素の木（`git archive upstream/master`）に対して行った。
`master` = `be3672c` / `v14.3.3` 時点。

| # | 内容 | 影響 | 種別 |
| --- | --- | --- | --- |
| 1 | ロケールキー 5 件が全言語で未定義 | UI にキー文字列がそのまま出る | Bug |
| 2 | マニフェストの cover 画像が存在しない | パッケージ一覧で画像が割れる | Bug |
| 3 | `en` の Compendium 翻訳にフランス語が残存（説明文 145 件） | 英語環境で説明文がフランス語 | Bug |
| 4 | `sra2.anarchy-objets.json` の `id` が 6 件重複 | 一方の訳が到達不能 | Bug |
| 5 | NPC ジェネレーターの仏英名の食い違い 4 件 | 言語によって別の装備に見える | Bug |
| 6 | `Bus / Truck` と `Bus / Semi-trailer` の不一致 | 同じ車種が 2 つの名前で出る | 軽微 |
| 7 | `ICE` の表記（公式は `IC`） | 用語 | 要相談 |
| 8 | 登録されていないシート基底クラスが存在しないテンプレートを指す | 実害なし（死んだコード） | 軽微 |
| 9 | Dice So Nice のカラーセット名がロケールキーを通らない | 設定画面で翻訳できない | Bug |
| 10 | サイバーデッキ・プログラム表の `label` が未使用 | 実害なし（死んだフィールド） | 軽微 |

---

## 1. ロケールキー 5 件が全言語で未定義

`item-search.ts` が参照する次の 5 キーは `en.json` / `fr.json` の
どちらにも存在しない。Foundry は未定義キーをキー文字列のまま返すので、
エラーにはならず **UI にそのまま出る**。

| キー | 出る場所 |
| --- | --- |
| `SRA2.SKILLS.ADD` | 検索結果の追加ボタンのラベル（`item-search.ts:294`） |
| `SRA2.SKILLS.ITEM_NOT_FOUND` | 通知 |
| `SRA2.ALREADY_EXISTS` | 通知 |
| `SRA2.SKILLS.ADDED` | 通知 |
| `SRA2.SKILLS.ERROR_ADDING` | 通知 |

ビルド後の `public/index.mjs` に 5 件すべて含まれており、死んだコードではない。

付随して、`item-search.ts` が **`src/` の外（リポジトリ直下）** に置かれている。
`tsconfig.json:48` で個別に include されているためビルドは通るが、`src/` を
走査する種類のチェック（本フォークの `locale-key-references.test.ts` を含む）から
漏れる。この 5 件が今まで見つからなかったのはそのため。`src/module/helpers/` へ
移すだけで、以後この種の見落としは起きない。

## 2. マニフェストの cover 画像が存在しない

`public/system.json` の `media[0].url` が `systems/sra2/style/sra2-logo.webp` を
指しているが、このファイルは上流の木に存在しない（`sra2-logo` に一致する
パスが 0 件）。Foundry のパッケージ一覧・インストール画面でカバー画像が割れる。

## 3. `en` の Compendium 翻訳にフランス語が残存

`public/lang/en/` の翻訳ファイルで、英語訳のはずの値がフランス語のまま。

| ファイル | エントリ | フランス語が残る `name` | 同 `description` |
| --- | --- | --- | --- |
| `sra2.anarchy-acteurs.json` | 160 | 33 | 0 |
| `sra2.anarchy-objets.json` | 559 | 14 | 145 |
| `sra2.sra2-skills.json` | 15 | 0 | 0 |

件数はフランス語の機能語による推定なので多少の誤差はあるが、実物は明確。例：

```
"Anti-magie"  → "<p>Seulement sur les défenses contre les sortilèges.</p>"
"Ares Antioch II" → "<p>Lance-grenade. Dégats de zone</p>"
```

`name` 側には `"Armor mystique"` のような**途中まで訳された値**もある。

## 4. `sra2.anarchy-objets.json` の `id` が 6 件重複

`id`（フランス語名が鍵）が重複しているため、同じ鍵の 2 件目以降は到達しない。

| `id` | 影響 |
| --- | --- |
| `Démarqueur` | 片方だけ `description` を持つ → **訳が失われる** |
| `Guérison rapide` | 同上 |
| `Marqueurs furtifs` | 同上 |
| `Armure` | 両方同内容 |
| `Armure mystique` | 両方同内容 |
| `Frappe à distance` | 両方同内容 |

上の 3 件はどちらが勝つかで説明文が出るか消えるかが変わる。

## 5. NPC ジェネレーターの仏英名の食い違い

`src/module/config/npc-generator-data.ts`。`name` と `nameEn` で**別の物**を
指している。言語を切り替えると別の装備に見える。

| 行 | `name` | `nameEn` | 判断 |
| --- | --- | --- | --- |
| 1131 | `Lame monofilament Whisper`（刃） | `Whisper Monofilament Whip`（鞭） | 説明文が `Fouet`（鞭）なので**仏名が誤り** |
| 1338 | `Grenades fumigènes Meridian Haze`（発煙） | `Meridian Haze Gas Grenades`（ガス） | `weaponType: 'gas-grenades'`、説明文も催涙ガス → **仏名が誤り** |
| 2368 | `Blouson de moto SteetHide` | `StreetHide Biker Jacket` | **`SteetHide` は綴り誤り** |
| 2655 | `Proxénète : Velvet`（ポン引き） | `Fixer: Velvet`（フィクサー） | **職業が別物。どちらが意図か不明** |

1338 は、同じテーブルの 2096 行に本物の発煙手榴弾
（`Grenades fumigènes HazeCloud` / `HazeCloud Smoke Grenades`、仏英一致）が
別に存在するため、紛らわしさが実際の問題になる。

2655 だけは外から判断できない。説明文（「個人的なサービスと内密な情報の仲介」）と
`spec_criminal` の RR はどちらの職業にも当てはまる。

## 6. `Bus / Truck` と `Bus / Semi-trailer` の不一致

同じ車種が 2 か所で別の名前になっている（仏語側も同様）。

| 場所 | en | fr |
| --- | --- | --- |
| 車種ラベル `bus-truck` | `Bus / Truck` | `Bus / Camion` |
| 車両テンプレート `BUS_TRUCK` | `Bus / Semi-trailer (…)` | `Bus / Semi-remorque (…)` |

## 7. `ICE` の表記

`en.json` の 20 件の値が `ICE` / `ICEs` を使っている。Shadowrun の公式表記は
`IC`（Intrusion Countermeasures）で、`ICE` は旧版・俗称。仏語側は `Glace` で
統一されているため、影響は英語だけ。

**これは用語の判断で、上流の方針を確認すべき事項。** 本フォークでは日本語を
英語にフォールバックさせる設計上そのまま追従している。

> 権利・ライセンスに関わる論点（公式用語への準拠、Compendium データの出典）は
> 本フォークでは判断しない。報告する場合も人間が内容を確認してから投稿する。

## 8. 登録されていないシート基底クラスが存在しないテンプレートを指す

`src/module/applications/character-sheet.ts:22` の
`template: 'systems/sra2/templates/actor-character-sheet.hbs'` が指すファイルは
存在しない（あるのは `actor-character-sheet-v2.hbs`）。ただし
`registerSheet` されているのは `CharacterSheetV2` だけで、そちらが `template` を
上書きしているため**実行時には読まれない**。実害はないが、基底クラスを直接
登録すると壊れる。

## 9. Dice So Nice のカラーセット名がロケールキーを通らない

`src/module/helpers/dice-so-nice.ts:23,36` の `description` が英語の直書き。

```ts
dice3d.addColorset({ name: SRA2_NORMAL_COLORSET, description: 'SRA2 - Normal dice', … });
dice3d.addColorset({ name: SRA2_RISK_COLORSET,   description: 'SRA2 - Risk dice',   … });
```

この `description` は Dice So Nice の設定画面のカラーセット選択に出るため、
**実際に目に見える文字列**。`game.i18n.localize()` を通していないので、
フランス語でも英語のまま出る。

本フォークでは直せない。直すには `en.json` / `fr.json` に新しいキーを追加する
必要があり、既存の英語・フランス語翻訳には手を付けない方針のため。

## 10. サイバーデッキ・プログラム表の `label` が未使用

`src/module/helpers/npc-generator.ts:1457-1461` の表に `label` があるが、
生成処理が読むのは `field` だけで `label` はどこからも参照されない。

```ts
const programs = [
  { field: 'cyberdeckBiofeedback', label: 'Biofeedback' },
  …
];
```

表示されないので翻訳の対象ではないが、UI 文字列の検査に毎回引っかかる。
意図して残しているのか、表示するつもりだったのかが外から分からない。

---

## 報告しないもの

- `README.md` の `systems/sra2/sra2.css` — ビルド生成物で、木に無いのは正しい。
- 本フォーク側の都合（日本語 CSS、`ja.json`、フォーク独自のテストやワークフロー）
  は上流の問題ではないので、ここには書かない。

# 上流への報告候補

日本語化の作業中に見つかった**上流（`VincentVk9373/sra2`）側の問題**の一覧。
本フォークでは直していない（直すと追従が難しくなる）ものと、フォーク内では
回避したが上流にも伝えるべきものを、報告できる形まで固めて置いておく。

**この一覧は下書きである。** Issue / PR を実際に出すかどうかは人間が決める。
出す場合も、ライセンス・権利に触れる項目（§7）は本文をそのまま使わず、
人間が内容を確認してから投稿する。

確認は上流の素の木（`git archive upstream/master`）に対して行った。
`master` = `be3672c` / `v14.3.3` 時点。

§5〜§7 と §12〜§14 は、**フランス語版基本ルールブックの用語と突き合わせて**
裏付けを取っている。方法と境界（原文を repo に残さないこと）は
[translation-rules.md](translation-rules.md) §11 を参照。

| # | 内容 | 影響 | 種別 |
| --- | --- | --- | --- |
| 1 | ロケールキー 5 件が全言語で未定義 | UI にキー文字列がそのまま出る | Bug（本フォークで修正） |
| 2 | マニフェストの cover 画像が存在しない | パッケージ一覧で画像が割れる | Bug |
| 3 | `en` の Compendium 翻訳にフランス語が残存（説明文 145 件） | 英語環境で説明文がフランス語 | Bug |
| 4 | `sra2.anarchy-objets.json` の `id` が 6 件重複 | 一方の訳が到達不能 | Bug |
| 5 | NPC ジェネレーターの仏英名の食い違い 4 件（うち 2 件は原書で仏名が誤りと確定） | 言語によって別の装備に見える | Bug |
| 6 | `Bus / Truck` と `Bus / Semi-trailer` の不一致（原書は後者） | 同じ車種が 2 つの名前で出る | 軽微 |
| 7 | `ICE` の表記（原書の用語集は `IC`、`ice` は口語形） | 用語 | 要相談 |
| 8 | 登録されていないシート基底クラスが存在しないテンプレートを指す | 実害なし（死んだコード） | 軽微 |
| 9 | Dice So Nice のカラーセット名がロケールキーを通らない | 設定画面で翻訳できない | Bug（本フォークで修正） |
| 10 | サイバーデッキ・プログラム表の `label` が未使用 | 実害なし（死んだフィールド） | 軽微（本フォークで削除） |
| 11 | `.gitignore` 済みの LevelDB 残骸が追跡されている | 作業ツリーでパックが開けない | 軽微（本フォークで除去） |
| 12 | `Aile planante` と `Aile volante` の不一致（原書は後者） | 同じ機体が 2 つの名前で出る | 軽微 |
| 13 | `Bâteau pneumatique semi-rigide` の綴り（原書は `Bateau`） | 表記 | 軽微 |
| 14 | `spec_la-rue` の英語が `Spec: La rue`（フランス語のまま） | 英語環境で 1 件だけ仏語 | Bug |
| 15 | NPC の格納フォルダ名 `Generated` が名前で検索されている | 翻訳するとフォルダが分裂する | 軽微（本フォークで修正） |
| 16 | 生成チャットの能力値略号が全言語でフランス語（`FOR` / `VOL`） | 英語環境で略号だけ仏語 | Bug（本フォークで修正） |
| 17 | 生成チャットの `Armes :` が全言語でフランス語 | 同上 | Bug（本フォークで修正） |
| 18 | 生成チャットの武器・サイバーウェア名がテンプレートのフランス語名 | 英語環境でも装備名が仏語 | Bug（本フォークで修正） |

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

**本フォークでは修正した。** 検索処理を `src/module/helpers/item-search.ts` に移し、
検査対象へ含めた。追加ボタンと通知を共通の `SRA2.ITEM_SEARCH.*` に揃え、
必要な 5 キーを en/fr/ja に定義した。技能以外のアイテムにも使える文言にしている。

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

### 原書での裏付け

| 行 | 原書の語 | 結論 |
| --- | --- | --- |
| 1131 | **`Fouet monofilament`**（鞭）。`Lame monofilament` は原書に存在しない | 仏名が誤り。英名が正しい |
| 1338 | **`Grenades à gaz`**。原書は発煙手榴弾とガス手榴弾を別物として扱い、`fr.json` の `GAS_GRENADES` も `Grenades à gaz*` になっている | 仏名が誤り。英名が正しい |
| 2368 | 製品名なので原書には現れない | 綴り誤りの判定は変わらず |
| 2655 | **どちらの語も原書に無い。**フィクサー相当のコネ・アトウトは `Intermédiaire` | 下記 |

2655 は、原書の語彙では `Fixer` も `Proxénète` も使われていない。ただし同じ
テーブルに `Recruteur du milieu : Broker`（runner と雇い主を仲介する＝フィクサーの
役割）が既にあり、`Proxénète` は他に埋まっていない枠に収まる。説明文も
その読みと整合する。**仏名が意図で英名が誤りである可能性が高い**が、確証ではない
ため、どちらを正とするかは作者に尋ねるのが妥当。

## 6. `Bus / Truck` と `Bus / Semi-trailer` の不一致

同じ車種が 2 か所で別の名前になっている（仏語側も同様）。

| 場所 | en | fr |
| --- | --- | --- |
| 車種ラベル `bus-truck` | `Bus / Truck` | `Bus / Camion` |
| 車両テンプレート `BUS_TRUCK` | `Bus / Semi-trailer (…)` | `Bus / Semi-remorque (…)` |

**原書は 2 か所とも `Bus / semi-remorque`** なので、車種ラベル `bus-truck` 側
（`Bus / Camion` / `Bus / Truck`）が誤り。

## 7. `ICE` の表記

`en.json` の 20 件の値が `ICE` / `ICEs` を使っている。仏語側は `Glace` で
統一されているため、影響は英語だけ。

**原書の用語集自身が**、`glace`（女性名詞）を `contre-mesures d'intrusion` の
略語 `CI` と定義し、英語形として `IC` を、その口語形として `ice` を併記している。
したがって正式な略号は `IC` だが、`ice` も口語として認められた形であり
**誤りではない**。報告するなら「誤りの指摘」ではなく**表記統一の提案**が正確。

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

**本フォークでは修正した。** `SRA2.DICE_SO_NICE.NORMAL` / `.RISK` を
`en.json` / `fr.json` / `ja.json` に追加し、`registerDiceSoNice()` で
`game.i18n.localize()` を通している（`diceSoNiceReady` フックは i18n 初期化後に
走るので、登録時に解決して問題ない）。英語の値は直書きだった文字列と同一なので、
英語環境の表示は変わらない。上流にもそのまま持ち込める形。

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

**本フォークでは `label` を削除した**（`field` だけの表にした）。挙動は変わらない。
表示する意図があったのなら、サイバーデッキの feat 側に既にあるロケールキーを
使うのが筋なので、この表に英語を置く形には戻らないはず。

## 11. `.gitignore` 済みの LevelDB 残骸が追跡されている

`.gitignore` に `/public/packs` があるが、次の 7 ファイルは追跡されたまま。

```
public/packs/anarchy-items-en/{CURRENT,LOCK,LOG}
public/packs/anarchy-items-fr/{CURRENT,LOCK,LOG}
public/packs/packs.tgz
```

`CURRENT` の中身は `MANIFEST-000024` だが、その MANIFEST はコミットされて
いない。つまり**開けない LevelDB がコミットされている**。Foundry が使う
`classic-level` で確認した。

```
コミットされた状態 → IO error: …/MANIFEST-000024: No such file or directory
空のディレクトリ   → 新規作成されて正常に開く
ディレクトリ無し   → 新規作成されて正常に開く
```

**コミットされているほうが、何もコミットされていない場合より悪い。**

**本フォークでは除去した。** 不完全な LevelDB、`packs.tgz`、古い
`src/module/config/complication-data.ts.bak` は作業ツリーから除去し、ローカルの
既存ファイルを `local/upstream-backups/` へ退避した。再生成したパックは Git 管理外。
本フォークの配布 zip は `dist/` から作り、Compendium は含めない。

---

## 12. `Aile planante` と `Aile volante` の不一致

§6 と同じ形の不一致がもう 1 件ある。

| 場所 | en | fr |
| --- | --- | --- |
| 車種ラベル `glider-wing` | `Glider Wing` | `Aile planante` |
| 車両テンプレート `GLIDER_WING` | `Glider wing (…)` | `Aile volante (…)` |

**原書は `aile volante`** で、該当機体（`Artemis Industries Nightwing`）の
能力値もテンプレート側と一致する。車種ラベルの `Aile planante` が誤り。

## 13. `Bâteau pneumatique semi-rigide` の綴り

`fr.json` の `SRA2.FEATS.VEHICLE.TYPES.RIGID_INFLATABLE_BOAT`。
原書の表記は `Bateau`（アクサン・シルコンフレクスは付かない）。
`bâteau` はフランス語として誤り。表示されるラベルなので目に入る。

## 14. `spec_la-rue` の英語がフランス語のまま

`en.json` の `SRA2.NPC_GEN.SPECS.spec_la-rue` が `Spec: La rue`。
`en.json` 全体を走査して、フランス語が残っている値は**この 1 件だけ**だった
（§3 の Compendium 翻訳とは別のファイル）。原書の専門化名は `la rue` なので、
英語は `Spec: Street` が妥当。

## 報告しないもの

- `README.md` の `systems/sra2/sra2.css` — ビルド生成物で、木に無いのは正しい。
- 本フォーク側の都合（日本語 CSS、`ja.json`、フォーク独自のテストやワークフロー）
  は上流の問題ではないので、ここには書かない。

## 15. NPC の格納フォルダ名 `Generated` が名前で検索されている

`src/module/helpers/npc-generator.ts` は生成した NPC を `Generated` という
Actor フォルダに入れるが、**同じ文字列がフォルダ名と検索条件の両方**になって
いるため、名前を翻訳するとすでに作られたフォルダが見つからなくなる。

```ts
let folder = game.folders?.find((f) => f.type === "Actor" && f.name === "Generated");
if (!folder) folder = await Folder.create({ name: "Generated", … });
```

**本フォークでは修正した。** `helpers/npc-folder.ts` で
`flags.sra2-ja.generatedNPCs` を持つ Actor フォルダを優先する。flag がない既存の
`Generated` / `Généré` / `生成済み` を見つけた場合は flag を追加して再利用し、
以後の言語・名前変更でフォルダが分かれないようにした。新規フォルダにも flag を付ける。
更新前に任意名へ変えられたフォルダは自動移行できない。

## 16. 生成チャットの能力値略号が全言語でフランス語

`npc-generator.ts` の生成結果チャットが、能力値の略号を直書きしていた。

```ts
const attrLabels: Record<string, string> = {
  strength: "FOR", agility: "AGI", willpower: "VOL", logic: "LOG", charisma: "CHA",
};
```

`FOR`（Force）と `VOL`（Volonté）はフランス語の略号で、**英語環境でもそのまま
出る**。同じファイルの他の表示は `isEn` で切り替えているので、ここだけ漏れている。

**本フォークでは修正した。** `SRA2.ATTRIBUTES.*_SHORT` から取るようにし、
`WILLPOWER_SHORT` だけ既に存在していた並びに `STRENGTH_SHORT` / `AGILITY_SHORT` /
`LOGIC_SHORT` / `CHARISMA_SHORT` を追加した（en は `STR` / `AGI` / `LOG` / `CHA`、
fr は従来の `FOR` / `AGI` / `LOG` / `CHA`）。**英語環境の表示が `FOR`→`STR`、
`VOL`→`WIL` と変わる**が、これは誤りを直した結果。

## 17. 生成チャットの `Armes :` が全言語でフランス語

同じチャットの装備行が `Armes : ...`（および `Chrome : ...` / `Cash : ...`）と
直書きされており、英語環境でも `Armes` と出る。

**本フォークでは修正した。** `SRA2.NPC_GEN.CHAT.{CHROME,WEAPONS,CASH}` を追加し、
en は `Weapons`、fr は `Armes` にした。`Chrome` と `Cash` は英仏で同じ語なので
表示は変わらない。

あわせて金額の桁区切りが `toLocaleString(isEn ? "en-US" : "fr-FR")` と
二択だったため、`game.i18n.lang` を渡すようにしている（日本語は `en-US` と
同じ区切りなので表示は変わらない）。

## 18. 生成チャットの装備名がテンプレートのフランス語名

生成結果のチャット要約が、作成したアイテムではなく**テンプレートをそのまま**
読んでいる。`FeatTemplate.name` はフランス語名なので、英語環境でも
`Armes : Tonfas Meridian Guardian, Bolas Meridian Tangle` と出る。

```ts
const weaponNames = featResult.feats
  .filter((f) => f.featType === "weapon")
  .map((f) => f.name)        // ← テンプレートの仏名
  .join(", ") || "—";
```

表示名を言語に合わせて解決しているのは `buildFeatItem()` の方
（`isEn && template.nameEn ? template.nameEn : template.name`）で、
チャットはその結果を使っていない。サイバーウェア（`cyberNames`）も同じ。

シート上の装備名は正しい言語で出るため、**同じ NPC の装備がシートとチャットで
違う名前になる**。

**本フォークでは修正した。** テンプレートではなく作成済みの
`actor.items` を読むようにした（`createEmbeddedDocuments` の後なので、
シートに出ているものと同一のアイテム）。英語環境では `nameEn`、日本語環境では
`npc-generator-data-ja.ts` の訳が、シートとチャットの両方で同じように出る。
サイバーウェア側の「先頭 2 語だけ表示する」短縮は上流のまま残している。

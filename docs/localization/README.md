# SRA2 日本語 UI ローカライズ

対象は **SRA2 システムの UI と、上流が独自に用意した NPC 生成文**。Compendium / ルールブック本文は対象外
（理由と境界は [translation-rules.md](translation-rules.md)）。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run i18n:scan` | 進捗レポート（全体・セクション別・ハードコード文字列） |
| `npm run i18n:sync` | `en.json` から `ja.json` を生成・更新（既訳は保持、新規は `[JA] ` プレースホルダ） |
| `npm run check:i18n` | キー一致・プレースホルダ・HTML タグの検査（CI ゲート） |
| `npm run compendium:ja` | 英語パックの名称のみを日本語化した Compendium をローカル生成（同梱しない） |
| `npm test` | 単体テスト（ロケールキー参照・NPC 辞書・フォルダ移行・配布 zip ほか・CI ゲート） |
| `npm run check:layout` | 固定 px 幅・`nowrap` に日本語ラベルが収まるかの推定（Foundry 起動前の優先確認リスト・CI ゲート） |
| `npm run check:glossary` | SR5 用語集との相違・一致の突き合わせ表を生成（別途 chummer-web の checkout が必要。出力は Git 管理外） |
| `npm run i18n:hardcoded` | `game.i18n` を通っていない文字列の候補（現在 0 件。新規に出たら `hardcoded-strings.test.ts` が失敗する） |
| `node tools/i18n/apply-batch.mjs <batch.json>` | 翻訳バッチを検査付きで適用 |

## NPC ジェネレーターのデータ表

ジェネレーターが使う表は上流がフランス語と英語の 2 言語で持っている
（`npc-generator-data.ts` ほか）。日本語は英語側にフォールバックするので、
放っておくと生成した NPC のシートに英語が出る。

`npc-generator-i18n.ts` の 3 つのヘルパで扱いを 1 本化してある。

| ヘルパ | 用途 |
| --- | --- |
| `needsLocaleText()` | 表の言語と UI 言語が違うか（= ja かどうか） |
| `tableText(fr, en, override?)` | fr/en 対から 1 件取り出す。`override` があればそれを優先 |
| `localeText(text, override?)` | 取り出し済みの文字列を辞書で差し替える |

日本語の訳は**上流の文字列をキーにした辞書**に置く。上流の表に third field を
足すとマージのたびに衝突するため。

```
npc-generator-data-ja.ts     装備・特徴・呪文などの名前（1,886 件・仏名キー）
npc-generator-descs-ja.ts    同・説明文（1,986 件・仏名キー）
npc-generator-flavor-ja.ts   キーワード 80・行動 40・キャッチフレーズ 40（英語キー）
npc-generator-background-ja.ts
                            外見 404・癖 401・経歴 400・関係 400・愛着品 406（英語キー）
npc-generator-extra-ja.ts    ドローン名 300・武器効果 100（英語キー）
```

キーが外れると黙って英語に戻るので、対応する `*.test.ts` が
**上流の表に無いキー・訳の無いエントリの両方で失敗する**。

背景文 2,011 件・ドローン名 300 件・武器効果 100 件も日本語化済み。
製品名や人名の原綴りは保持し、分類語・文章を訳している。上流の英仏表は
変更せず、`tableText` の `override` で日本語を選ぶ。武器効果の英仏表は
`npc-weapon-effects.ts` に切り出し、対応する辞書との整合を検査する。
既存 NPC の保存済み文章には遡及せず、新しく生成する NPC に適用される。

生成先フォルダは `flags.sra2-ja.generatedNPCs` で識別する。flag がない場合は
英仏日の既存名（`Generated` / `Généré` / `生成済み`）を探して flag を追加し、
以後は言語やフォルダ名が変わっても同じフォルダを再利用する。更新前に利用者が
任意の名前へ変更したフォルダは自動判別できないため、この移行の対象にはならない。

## 技能・専門化の名前だけはパックより上に出す

技能と専門化は、NPC ジェネレーターがコンペンディウムのアイテムを複製して作り、
シートの RR 行（phantom）もパックから引いた名前を表示する。パックは英語と
フランス語しか無いので、日本語環境では**英語名がそのまま出ていた**。

`SRA2.NPC_GEN.SKILLS` / `SPECS`（技能 16 件・専門化 66 件）が定義されている
slug については、`compendiumNameOverride()` がその訳を名前に被せる。

- 英語・フランス語環境では**何もしない**（パックがその言語そのものなので、
  パック側の名前を正とする。`Spé : C&R drones` と `Spé : C/R drones` のように
  ロケールとパックで表記が違う箇所があり、パックを正とする）。
- ワールド内のアイテムは上書きしない。GM が自分で書いた名前が優先。
- 説明文は英語のまま。**名前だけ**で、Compendium 翻訳ではない。
- すでに生成済みのアクターの技能アイテム名は書き換わらない（保存済みデータの
  ため）。RR 行は描画のたびに解決するので遡って日本語になる。

パックにあって `SPECS` に無い専門化が 24 件あるが、いずれも
`SPEC_DEFINITIONS` に無いためジェネレーターが選ぶことはない。

## 英語のまま残すキー

略号（`RR` / `DV` / `ATK` / `AR` / `VTOL`）、記号（`OK` / `-` / `¥`）、製品名
（`Shadowrun Anarchy 2` など）の 16 キーは、日本語に置き換える形が存在しない
ため**意図的に英語のまま**にしている。これを未訳として数えると進捗を過小に
報告してしまうので、`tools/i18n/intentionally-identical.json` に理由付きで
列挙し、`i18n:scan` は翻訳済みとして数える。

一覧が実態からずれると本当の未訳を隠してしまうため、`check:i18n` は
**古くなったエントリで失敗する**（`en.json` から消えたキー、訳が入って同一で
なくなったキー）。逆に、一覧に無い同一値が `ja.json` に現れた場合は
`npm test` が失敗する。

バッチは `{"SRA2.SHEET.CHARACTER": "詳細"}` という平坦な JSON。
`en.json` に無いキー、プレースホルダや HTML タグを壊す訳が1件でもあれば
**何も書き込まずに失敗する**。

## ファイル

```
public/lang/ja.json            UI 翻訳
public/system.json             languages に ja を登録
src/module/config/npc-generator-data-ja.ts
                               NPC ジェネレーターの装備名（1,886 件）
src/module/config/npc-generator-descs-ja.ts
                               NPC ジェネレーターの説明文（1,986 件・HTML 含む）
src/module/config/npc-generator-background-ja.ts
                               背景文（2,011 件）
src/module/config/npc-generator-extra-ja.ts
                               ドローン名・武器効果（400 件）
tools/i18n/                    同期・検査スクリプト（依存ゼロ）
tools/i18n/intentionally-identical.json
                               英語のまま残すキーの一覧（略号・記号・製品名）
docs/localization/             ルールと用語、上流への報告候補
.github/workflows/i18n.yml     CI
```

## 開発環境で Foundry に読ませるとき

`public/` を `<Foundry Data>/systems/sra2-ja` へリンクして起動する場合、先に

```
npm run build:public        # src/ → public/ をビルド
npm run pack:compendiums    # src/packs/ → public/packs/ を LevelDB にする
```

を実行する。後者は英仏の名称・数値パックを使う場合に必要。
生成した LevelDB は Git 管理外で、未生成なら Foundry 側では空パックになる。
以前の `CURRENT` / `LOCK` / `LOG` だけがある不完全な LevelDB と `packs.tgz`、
古い `.bak` は作業ツリーから除去した。既存のローカルデータは
`local/upstream-backups/` に退避しており、配布物には含まれない。

配布用は `npm run build:release` を使う。最新の `dist/` から
`foundry-sra2-ja-v<version>.zip` を生成し、Compendium とソースマップを除外する。
`public/` の同梱バンドルを更新し忘れても古いコードが配布されない。

## 本家追従

```
git fetch upstream && git merge upstream/master
npm run i18n:sync     # 新規キーが [JA] プレースホルダで入る
npm run check:i18n
npm run i18n:scan     # 残作業を確認
```

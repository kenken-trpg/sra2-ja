# SRA2 日本語 UI ローカライズ

対象は **SRA2 システムの UI** のみ。Compendium / ルールデータは対象外
（理由と境界は [translation-rules.md](translation-rules.md)）。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run i18n:scan` | 進捗レポート（全体・セクション別・ハードコード文字列） |
| `npm run i18n:sync` | `en.json` から `ja.json` を生成・更新（既訳は保持、新規は `[JA] ` プレースホルダ） |
| `npm run check:i18n` | キー一致・プレースホルダ・HTML タグの検査（CI ゲート） |
| `npm run compendium:ja` | 英語パックの名称のみを日本語化した Compendium をローカル生成（同梱しない） |
| `npm test` | 単体テスト 217 件（ロケールキー参照・マニフェスト整合・レイアウト予算ほか・CI ゲート） |
| `npm run check:layout` | 固定 px 幅・`nowrap` に日本語ラベルが収まるかの推定（Foundry 起動前の優先確認リスト・CI ゲート） |
| `npm run check:glossary` | SR5 用語集との相違・一致の突き合わせ表を生成（別途 chummer-web の checkout が必要。出力は Git 管理外） |
| `npm run i18n:hardcoded` | `game.i18n` を通っていない文字列の候補（残り 6 件。理由は `hardcoded-strings.test.ts`） |
| `node tools/i18n/apply-batch.mjs <batch.json>` | 翻訳バッチを検査付きで適用 |

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
tools/i18n/                    同期・検査スクリプト（依存ゼロ）
tools/i18n/intentionally-identical.json
                               英語のまま残すキーの一覧（略号・記号・製品名）
docs/localization/             ルールと用語、上流への報告候補
.github/workflows/i18n.yml     CI
```

## 本家追従

```
git fetch upstream && git merge upstream/master
npm run i18n:sync     # 新規キーが [JA] プレースホルダで入る
npm run check:i18n
npm run i18n:scan     # 残作業を確認
```

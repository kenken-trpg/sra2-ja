# SRA2 日本語 UI ローカライズ

対象は **SRA2 システムの UI** のみ。Compendium / ルールデータは対象外
（理由と境界は [translation-rules.md](translation-rules.md)）。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run i18n:scan` | 進捗レポート（全体・セクション別・ハードコード文字列） |
| `npm run i18n:sync` | `en.json` から `ja.json` を生成・更新（既訳は保持、新規は `[JA] ` プレースホルダ） |
| `npm run check:i18n` | キー一致・プレースホルダ・HTML タグの検査（CI ゲート） |
| `npm run i18n:hardcoded` | `game.i18n` を通っていない文字列の候補 |
| `node tools/i18n/apply-batch.mjs <batch.json>` | 翻訳バッチを検査付きで適用 |

バッチは `{"SRA2.SHEET.CHARACTER": "詳細"}` という平坦な JSON。
`en.json` に無いキー、プレースホルダや HTML タグを壊す訳が1件でもあれば
**何も書き込まずに失敗する**。

## ファイル

```
public/lang/ja.json            UI 翻訳
public/system.json             languages に ja を登録
tools/i18n/                    同期・検査スクリプト（依存ゼロ）
docs/localization/             ルールと用語
.github/workflows/i18n.yml     CI
```

## 本家追従

```
git fetch upstream && git merge upstream/master
npm run i18n:sync     # 新規キーが [JA] プレースホルダで入る
npm run check:i18n
npm run i18n:scan     # 残作業を確認
```

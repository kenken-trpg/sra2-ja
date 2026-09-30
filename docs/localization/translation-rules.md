# SRA2 日本語化ルール

## 0. スコープ

本タスクは **SRA2 という Foundry VTT システムの日本語 UI 化** である。
Shadowrun Anarchy のルールブック由来のゲームデータを翻訳・再配布することは
対象外とする。

| 対象 | 本タスク |
| --- | --- |
| `public/lang/en.json` 相当の UI 文字列 | 実施する |
| `system.json` の言語登録 | 実施する |
| 日本語表示のための CSS 調整 | 必要最小限で実施する |
| Babele 用 Compendium 翻訳（`public/lang/<lang>/*.json`） | **実施しない**（別タスク） |
| `src/packs` のアイテム・アクターデータ | **実施しない** |
| 公式日本語版ルールブックの文章 | **転載しない** |

Compendium・ルール本文の日本語化に着手する場合は、権利関係を人間に確認して
から別タスクとして扱う。作業用のブランチは `localization/ja-compendium` に
分離してある。

## 1. 権利・ライセンスの現状（未確定・人間の判断が必要）

リポジトリのライセンス表記は **不整合のまま** である。独自に確定させない。

- `public/LICENSE.md` の見出し: `CC BY-SA 4.0`
- 同ファイル本文のリンク・バッジ: `CC BY 4.0`
- 同ファイル末尾: MIT 由来の無保証条項
- `README.md:190`: 「Creative Commons BY-SA」と書きつつリンク先は BY 4.0
- リポジトリ直下に `LICENSE` / `LICENSE.md` は存在しない（`public/LICENSE.md` のみ）
- `CONTRIBUTING` は存在しない

また README は次を明記している。

- Shadowrun Anarchy は © 2016 The Topps Company, Inc.
- Shadowrun / Matrix は Topps の登録商標
- 本システムは Topps / Catalyst Game Labs / Black Book Editions の公式製品ではない
- **著作権上の理由から、事前作成済み Compendium を同梱していない**（`README.md:18-20`）

→ 「CC ライセンスだから問題ない」という判断はしない。疑義が出たら作業を止めて報告する。

## 2. 翻訳する / しない

| 対象 | 扱い |
| --- | --- |
| locale JSON の値 | 翻訳する |
| locale JSON のキー | 翻訳しない |
| Actor ID / Item ID / Compendium ID / UUID / Document ID | 翻訳しない |
| system key、CSS クラス、HTML 属性、Foundry API | 翻訳しない |
| JavaScript / TypeScript / Handlebars 構文、マクロ | 翻訳しない |

## 3. 壊してはいけない構文

- `{name}` のような `game.i18n.format` のプレースホルダ（綴りと個数を変えない）
- `@UUID[...]`、`@Compendium[...]`
- `[[ ... ]]` のインラインロール
- HTML タグ（種類・開閉・個数を保つ）

`tools/i18n/compare-locales.mjs` と `apply-batch.mjs` が機械的に検査する。
検査に落ちた場合、`apply-batch.mjs` は **1件も書き込まない**。

## 4. プレースホルダ運用

未訳の値は `[JA] <英文>` の形で入っている。`[JA]` が付いている限り未訳として
集計されるので、訳すときはマーカーごと置き換える。

## 5. 用語

`tools/i18n/terminology.json` を唯一の正とする。優先順位は

1. 既存の日本語版 Shadowrun で定着している用語
2. SRA2 固有の概念に対する新規訳

`keep` に挙げた語は原文表記のまま残す。判断の経緯は `glossary-ja.md`。

## 6. 作業単位

一度に全部訳さない。`SRA2.SHEET.*` のようなキー空間単位で小さく進め、
そのたびに `npm run check:i18n` を通す。

優先順位（指示書 §7）: キャラクターシート → システム設定 → ダイアログ →
ボタン・メニュー → ロール/ダイス → エラー・警告 → その他。

## 7. 既知の前提・未解決事項

- **`en.json` の実インデントは 4 スペース**。`.cursorrules` は 2 スペースと
  書いているが実ファイルが正。ツールは 4 スペースで出力する。
- `fr/` ディレクトリは存在せず、フランス語は UI のみ翻訳済み。
- Babele の初期化は `src/module/sra2-system.ts:177` でコメントアウトされている
  （`// Deactivated`）。Compendium 翻訳は現状ランタイムに適用されない。
- `public/lang/en/sra2.anarchy-objets.json` に重複 `id` が 6 件ある。Babele は
  id 一致で引くため重複分は到達不能。本家に報告する価値がある。
- `src/module/config/npc-generator-data.ts` などに、locale キーを通らない
  表示文字列が多数ある（`npm run i18n:hardcoded`）。日本語 UI を完全にするには
  本体コード側の i18n 化が必要で、これは翻訳ではなく実装変更。別タスク。

## 8. 人間の判断を待って保留しているキー（41件）

次の2群は **意図的に未訳** のままにしている。値がルールブックのデータ表
そのもの（武器の分類と実在の製品名、車両の能力値一式）であり、指示書の
「ルールブック由来データの翻訳・再配布は対象外」に該当するか、人間の判断が
必要なため。

- `SRA2.FEATS.WEAPON.TYPES.*`（22件）
  例: `Heavy Pistols (Ares Viper Slivergun, Browning Ultra Power, Colt Manhunter)`
- `SRA2.FEATS.VEHICLE.TYPES.*`（19件）
  例: `Microdrone (Autopilot 6, Structure 0, Handling 10, Speed 0 (flying 1), Armor 0, no weapon mount)`

いずれもドロップダウンの選択肢ラベルなので、未訳でも機能は損なわれない
（英語が表示される）。翻訳して良いと判断された場合は、短い分類名だけを訳し
製品名は原文のまま残す方針を推奨する。

なお `SRA2.VEHICLE.TYPES.*`（車両アクターの種別名）は能力値を含まない短い
分類名のみなので翻訳済み。

## 9. 日本語 CSS の状況

- `src/less/theme-mixins.less` の全フォント変数に CJK フォールバックを追加した。
  同梱テーマフォント（`sra2_foundry_*`）は Latin のみを収録しているため、
  これがないと日本語がグリフ単位でブラウザ既定フォントに落ちる。
- 固定幅は多い（`width|height: <n>px` が 256 箇所、`white-space: nowrap` が
  38 箇所）。**文字切れ・重なりの有無は Foundry 上での目視確認が必要** で、
  未確認のまま幅を変更すると英語・フランス語のレイアウトを壊すため手を付けていない。

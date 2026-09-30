# Shadowrun Anarchy 2 日本語版（`sra2-ja`）

Foundry VTT 用の非公式 **Shadowrun Anarchy 2** システム
[VincentVk9373/sra2](https://github.com/VincentVk9373/sra2) を日本語化した
フォークです。システム本体の功績はすべて上流の作者にあります。

> **非公式のファンプロジェクトです。**
> The Topps Company / Catalyst Game Labs / Black Book Editions の公式製品では
> なく、これらの承認も受けていません。プレイにはルールブックが必要です。

## 上流との関係

- システム ID は `sra2-ja`（上流は `sra2`）。**上流版と同時にインストールできます。**
- そのかわり、**上流版 `sra2` で作成したワールドはこのシステムでは開けません。**
  Foundry のワールドは system id で紐づいているためです。
- バージョンは上流の基準バージョンにフォーク側の連番を付けた形式
  （例: `14.3.3-ja.1`）で、上流 `14.3.3` 相当であることを示します。

## インストール

Foundry VTT の「システムのインストール」で、マニフェスト URL に以下を指定します。

```
https://raw.githubusercontent.com/kenken-trpg/sra2-ja/master/public/system.json
```

インストール後、Foundry の言語設定で **日本語** を選択してください。

## Compendium の追加

本フォークの配布 zip には **Compendium を同梱していません**（`packs/` を含めずに
アーカイブしています）。ルールブック本文を再配布しないためです。
そのかわり、以下のいずれかの方法で Compendium を利用できます。

### 1. 上流版の Compendium を持ち込む

上流 `sra2` の配布 zip には `packs/anarchy-items-en` と `packs/anarchy-items-fr`
が含まれています（内容はアイテム名と数値データのみで、説明文フィールドは空です）。
上流 README も「著作権上、完成品の Compendium は提供しない」としており、
ルールブックの文章は含まれません。

Foundry を終了した状態で、上流 zip 内の

```
sra2/packs/anarchy-items-en/
sra2/packs/anarchy-items-fr/
```

を、本システムのインストール先へ **同じフォルダ名のまま** コピーします。

```
<Foundry Data>/systems/sra2-ja/packs/anarchy-items-en/
<Foundry Data>/systems/sra2-ja/packs/anarchy-items-fr/
```

フォルダ名は `public/system.json` の `packs[].name` と一致していなければ
認識されません。本フォークが宣言しているのは上記 2 つです。
Foundry を起動すると Compendium タブに現れます。

> システムを更新すると `systems/sra2-ja/` 以下は置き換えられるため、
> ここに置いた Compendium は消える可能性があります。残したい内容は
> ワールド側の Compendium（後述）へインポートしてください。

### 2. 自分の Compendium を作る

**ワールド内に作る方法（推奨）**
Foundry の Compendium タブ →「Compendium パックを作成」でワールド所属の
Compendium を作り、自分で作成したアイテムをドラッグして登録します。
システム更新の影響を受けません。

**システムに同梱する方法（上級者向け）**
本リポジトリのソース形式に合わせるなら、`src/packs/<パック名>/` に
1 ドキュメント 1 ファイルの JSON（`_id` / `_key` / `type` を持つ形式）を置き、

```sh
npm run pack:compendiums     # src/packs/ → public/packs/（LevelDB 形式に変換）
npm run unpack:compendiums   # public/packs/ → src/packs/（JSON に戻す）
```

で変換します。新しいパック名を使う場合は `public/system.json` の `packs[]` に
同じ `name` の項目を追加してください。

**お手持ちのルールブックの文章をそのまま入力したデータは、個人利用の範囲に
留めてください。** 本リポジトリへの取り込みや再配布は行いません。

## 日本語化の範囲

| 対象 | 状態 |
| --- | --- |
| システム UI（シート、設定、ダイアログ、ダイス、エラー） | 日本語化済み |
| 日本語表示のためのフォント・レイアウト調整 | 実施済み（最小限） |
| Compendium / ルールブック本文 | **対象外**（同梱なし。[Compendium の追加](#compendium-の追加)参照） |

ルールブックの文章は転載していません。UI の文言のみを翻訳しています。
Compendium の日本語化は権利関係の確認が必要な別課題として切り離しており、
作業用ブランチ `localization/ja-compendium` に分離しています。

翻訳の方針・用語統一・禁止事項は **[docs/localization/](docs/localization/)**
にまとめています。

- [翻訳ルール](docs/localization/translation-rules.md)
- [用語集](docs/localization/glossary-ja.md)

## 開発

```sh
npm install
npm run build          # dist/ にビルド
npm run build:public   # public/ の同梱ビルド成果物を更新
npm run i18n:scan      # 翻訳の進捗を表示
npm run check:i18n     # en.json とのキー整合・構文破損を検査
npm run check:layout   # 日本語ラベルがレイアウトに収まるかの推定レポート
npm run check:glossary # SR5 用語との突き合わせ（要 chummer-web の checkout・出力は Git 管理外）
npm run i18n:sync      # en.json の変更を ja.json に取り込む
npm run test
```

CI（`.github/workflows/i18n.yml`）は 2 ジョブ構成です。**Locale checks** が
`i18n:scan` / `check:i18n` / `check:layout` と `en.json` からのずれを検査し
（依存なしで動くので `npm ci` 不要）、**Test suite** が `npm ci` の後に
`npm test`（187 件）と、本フォークが追加したテスト・ツールの型検査を実行
します。上流由来の型エラーは対象外です。

### 既知の問題（上流由来）

以下は本フォークの変更ではなく、上流 `master` でも同じ結果になります。

- `npm run typecheck` が 88 件のエラーを出す
- `npm run test` で `src/module/__tests__/dice-roller.test.ts` が失敗する
  （`ReferenceError: foundry is not defined`）。他 90 件のテストは成功。

## ライセンス

本フォークは **[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)**
で配布します。上流のライセンス表記は BY と BY-SA が混在しており未確定のため、
制約の強い BY-SA 側に寄せています（BY-SA を守れば BY の条件も満たすため）。
詳細と上流表記の原文は [LICENSE.md](LICENSE.md) を参照してください。

Shadowrun Anarchy は © 2016 The Topps Company, Inc.
Shadowrun および Matrix は The Topps Company, Inc. の登録商標です。

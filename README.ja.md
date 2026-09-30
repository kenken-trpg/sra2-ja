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

## 日本語化の範囲

| 対象 | 状態 |
| --- | --- |
| システム UI（シート、設定、ダイアログ、ダイス、エラー） | 日本語化済み |
| 日本語表示のためのフォント・レイアウト調整 | 実施済み（最小限） |
| Compendium / ルールブック本文 | **対象外** |

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
npm run i18n:sync      # en.json の変更を ja.json に取り込む
npm run test
```

`npm run check:i18n` は CI（`.github/workflows/i18n.yml`）でも実行され、
上流の `en.json` と `ja.json` がずれた場合に失敗します。

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

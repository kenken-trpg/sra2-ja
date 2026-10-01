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
この 2 パックにルールブックの文章は含まれません（`src/packs/` の全 230
ファイルを走査して `description` が 0 件であることを確認済み）。

> 同じ zip の `packs/packs.tgz` は**別物**です。宣言されていない 2 パック
> （feat 559 件・NPC 1903 件）が入っており、ルール内容を説明する文章が
> 約 200 件・計 32,500 文字（最長 604 文字）含まれます。本フォークは
> これを翻訳・再配布しません。

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

### 2. 日本語版の名称パックを生成する

上記 1 の英語パックから、**名称のみを日本語化した Compendium** をローカルで
生成できます。配布 zip には含まれません（`LICENSE.md` の「完成品の Compendium
を同梱しない」方針を変えないため）。

```sh
npm run compendium:ja                            # local/packs/anarchy-items-ja を生成
node tools/compendium/generate-ja.mjs --check    # 訳語の抜けだけ確認（書き出さない）
```

訳語は `public/lang/{en,ja}.json` から引きます（115 件のうち 88 件）。UI と
Compendium が食い違わないようにするためで、専用の辞書は持ちません。ロケールに
対応する文字列がない 25 件だけを `tools/compendium/names-ja.json` が補います。

設置方法はコマンドの出力が案内します（インストール先へのコピーと、`system.json`
の `packs` への 1 エントリ追記）。`_id` を含め `name` 以外のフィールドは一切
変更しないので、既存キャラクターのアイテム参照は壊れません。

> このスクリプトは説明文を持つドキュメントを検出すると**中止します**。名称のみ
> を扱う方針をコード側で強制しているため、`packs.tgz` の内容を誤って入力にして
> も翻訳されません。

### 3. 自分の Compendium を作る

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
npm run setup:hooks    # push ガードレールを有効化（clone ごとに1回）
npm run build          # dist/ にビルド
npm run build:public   # public/ の同梱ビルド成果物を更新
npm run i18n:scan      # 翻訳の進捗を表示
npm run check:i18n     # en.json とのキー整合・構文破損を検査
npm run check:layout   # 日本語ラベルがレイアウトに収まるかの推定レポート
npm run check:glossary # SR5 用語との突き合わせ（要 chummer-web の checkout・出力は Git 管理外）
npm run i18n:sync      # en.json の変更を ja.json に取り込む
npm run test
```

### push ガードレール

`git` はフックもローカル設定も clone に含めないため、clone ごとに一度だけ
`npm run setup:hooks`（= `sh tools/git-hooks/install.sh`）を実行します。
設定はすべて `--local` で、グローバル設定や他のリポジトリには触りません。

| 設定 | 効果 |
| --- | --- |
| `core.hooksPath=tools/git-hooks` | `tools/git-hooks/pre-push` を有効化 |
| `push.default=nothing` | 引数なし `git push` を拒否 |
| `push.followTags=false` | タグが push に相乗りしない |
| `remote.upstream.pushurl=no_push` | 上流（作者のリポジトリ）へ push できない |
| `remote.origin.gh-resolved=base` | `gh` の既定リポジトリを本フォークに固定 |

remote が3つあると `gh` は対象リポジトリを自分で解決するため、`gh pr create` や
`gh issue create` が**作者のリポジトリに向く**ことがあります。`origin` が
本フォークのときだけ既定に固定し、上流の clone では何もせず警告だけ出します
（そこで `base` を設定すると逆に作者のリポジトリを指してしまうため）。
既に設定済みの値は上書きしません。

`pre-push` は**既定で拒否**し、remote ごとの許可リストに載った宛先だけを通します
（`origin` は `master` と `localization/ja` / `localization/ja-stage2`、`prfork` は
`fix/*` と `feat/*`）。`refs/heads/localization/*` のようなワイルドカードにはせず
**ブランチ名を個別に列挙**しています。この接頭辞の下に新しいブランチを作ったとき、
黙って push 可能になってしまうのを避けるためです。さらに
`localization/ja-compendium` は**宛先を問わず送信元として禁止**します。宛先だけを
見ると `localization/ja-compendium:master` と書けば通ってしまうため、送信元ブランチ
名でも独立に判定しています（`--force` でも貫通しません）。

意図的に破るときは `SRA2_PUSH_OVERRIDE=1 git push …` とします。環境変数はシェル
履歴に残るので、事故と意図の区別が後から付きます。

> フックは GitHub 側の操作（Web UI・`gh`）には効きません。origin 側でのブランチ
> 作成やマージを縛るには GitHub のルールセットが必要です。

### GitHub ルールセット（サーバー側）

フックは clone 内にしか効かないため、origin 側にもルールセットを置いています。
いずれも `bypass_actors` が空で、**リポジトリ管理者も解除できません**
（`current_user_can_bypass: "never"`）。

| ID | 対象 | ルール | 目的 |
| --- | --- | --- | --- |
| `24287336` | `refs/heads/master` | `deletion` / `non_fast_forward` | 公開ブランチの削除と履歴改変を防ぐ |
| `24287364` | `localization/ja-compendium` と同 `/**` | `creation` / `update` | ローカル限定ブランチが origin に現れるのを防ぐ |
| `24299481` | `refs/tags/v*-ja.*` | `deletion` / `update` / `non_fast_forward` | リリースタグの削除と貼り替えを防ぐ |

一覧の確認:

```bash
gh api repos/kenken-trpg/sra2-ja/rulesets -q '.[]|"\(.id)  \(.target)  \(.name)  \(.enforcement)"'
```

タグ側は `creation` を**含めていません**。新しいリリースタグは通常どおり作れます。
既存タグの貼り替えが本当に必要になった場合だけ、一時的に解除します。

```bash
gh api -X PUT repos/kenken-trpg/sra2-ja/rulesets/24299481 -f enforcement=disabled
# 作業後に必ず戻す
gh api -X PUT repos/kenken-trpg/sra2-ja/rulesets/24299481 -f enforcement=active
```

> `branch_name_pattern` は Team / Enterprise 限定で、本アカウントでは 422 になります
> （`enforcement: disabled` でも同様で、ルール種別そのものが使えません）。そのため
> 禁止ブランチは名前パターンではなく、`creation` と `update` の適用対象を
> `refs/heads/localization/ja-compendium` と同 `/**` に限定する形で表現しています。
> `tag_name_pattern` は未試行です。

CI（`.github/workflows/i18n.yml`）は 2 ジョブ構成です。**Locale checks** が
`i18n:scan` / `check:i18n` / `check:layout` と `en.json` からのずれを検査し
（依存なしで動くので `npm ci` 不要）、**Test suite** が `npm ci` の後に
`npm test`（201 件）と、本フォークが追加したテスト・ツールの型検査を実行
します。上流由来の型エラーは対象外です。

### 既知の問題（上流由来）

以下は本フォークの変更ではなく、上流 `master` でも同じ結果になります。

- `npm run typecheck` が 80 件のエラーを出す（本フォークが追加したファイルは
  CI で個別に型検査しており、そちらは通る）

> かつてここに挙げていた `dice-roller.test.ts` の
> `ReferenceError: foundry is not defined` は解消済みで、`npm test` は
> 201 件すべて成功します（`src/module/__tests__/setup-foundry.ts`）。

## ライセンス

本フォークは **[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)**
で配布します。上流のライセンス表記は BY と BY-SA が混在しており未確定のため、
制約の強い BY-SA 側に寄せています（BY-SA を守れば BY の条件も満たすため）。
詳細と上流表記の原文は [LICENSE.md](LICENSE.md) を参照してください。

Shadowrun Anarchy は © 2016 The Topps Company, Inc.
Shadowrun および Matrix は The Topps Company, Inc. の登録商標です。

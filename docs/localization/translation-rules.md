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

### 本フォークでの暫定方針

上流の表記が確定するまで、**本フォークは CC BY-SA 4.0 として扱う**。

- BY-SA は BY に ShareAlike（同一ライセンスでの継承）を加えたもので、BY より
  制約が強い。BY-SA として振る舞えば、上流が実際には BY だった場合も
  条件を満たす。逆（BY として扱う）は、上流が BY-SA だった場合に違反する。
- したがって本リポジトリの成果物（`public/lang/ja.json` を含む）は
  CC BY-SA 4.0 で配布する前提で作業する。
- これは**安全側に寄せた運用上の仮定**であり、上流のライセンスを確定させる
  判断ではない。上流に照会中で、回答が出たら本節を更新する。

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

英語のまま残すのが正しいキー（略号・記号・製品名）は
`tools/i18n/intentionally-identical.json` に理由を添えて登録する。登録せずに
英文のまま置くと未訳として数えられ、進捗が実態より低く出る。登録が実態と
合わなくなると `check:i18n` と `npm test` が失敗する。

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

## 8. 武器・車両の種別ラベル（41件）

`SRA2.FEATS.WEAPON.TYPES.*`（22件）と `SRA2.FEATS.VEHICLE.TYPES.*`（19件）は
値がルールブックのデータ表そのもの（武器の分類と実在の製品名、車両の能力値
一式）であるため、長く未訳で保留していた。**人間の判断により全訳した。**

判断の根拠:

- 括弧内の語彙（Autopilot / Structure / Handling / Speed / Armor /
  Weapon Mount）は**すべて既に他のキーで訳済み**であり、訳出は既訳の再利用に
  すぎない。新しいルール用語を作っていない。
- 車両の分類名は `SRA2.VEHICLE.TYPES.*` に訳があるので**そのまま再利用**した。
  同じ車両が2通りの名前で表示される事態を避けるため。
- 製品名（`Ares Light Fire` など）は固有名詞なので**英字のまま残す**。
- 数値は不変。読み手が得る情報量は英語版と同一。

表記は本書の規約どおり全角括弧 `（）` と読点 `、` を使う（ja.json 全体で
半角カンマは0件）。原文の脚注記号 `*` / `**` は**そのまま維持**する。参照先の
脚注は UI 上に存在しないが、記号を落とすと原文が持つ区別が失われるため。

> 上流の `en.json` には、同じ車両を `SRA2.VEHICLE.TYPES.bus-truck` では
> `Bus / Truck`、`SRA2.FEATS.VEHICLE.TYPES.BUS_TRUCK` では
> `Bus / Semi-trailer` と書いている不整合がある。当初は**それぞれの原文に忠実に**
> 訳していたが、原書が 2 か所とも `Bus / semi-remorque` であることを確認したため
> （§11）、**両方を `バス／セミトレーラー` に揃えた**。英語側の `Bus / Truck` は
> 誤りなので、原文への忠実さよりも原書との一致を採る。上流への報告候補
> （[upstream-reports.md](upstream-reports.md) §6）。

## 9. NPC ジェネレーターの装備名（段階実施中）

`src/module/config/npc-generator-data.ts` の装備テンプレート 1,986 件は、
`game.i18n` を通らずアクターのアイテム名として直接書き込まれる。日本語名は
**上流のファイルを変更せず** `src/module/config/npc-generator-data-ja.ts` に
別置きする。

### なぜ別ファイルなのか

- データテーブルに `nameJa` を足すのが設計上は素直だが、当該ファイルは 835KB /
  3,088 行あり上流がデータ追加で頻繁に触る。2,000 行規模の差分を恒久的に抱えると
  **毎回のマージが壊れる**。本フォークの生命線は上流追従なので採らない。
- ロケールキー方式（`ja.json`）も検討したが、テンプレートに **id / slug が無く**、
  同一性はフランス語の `name` 文字列しかない。キーをフランス語名から生成すると
  上流の些細な改名でキーが静かに孤児化する。
- 別ファイルなら上流無変更でマージ衝突が起きず、ズレは**テストで検出できる**
  （`npc-generator-data-ja.test.ts`）。

### 鍵の形

`featType` で入れ子にしたフランス語名。同じフランス語名が spell / adept-power /
trait に存在し、上流が異なる英語名を与えている例が 4 件あるため、平坦な表では
区別が失われる。

> `Résistance à la douleur` → spell: `Pain Relief` / adept-power:
> `Pain Resistance` / trait: `Pain Tolerance`

### 訳し方

製品名はすべて**上流の作者による創作**でルールブック由来ではない。形は
`<製品名> + <分類語>` で統一されているので、**分類語だけを訳し製品名は英字のまま
残す**（§8 の武器ラベルと同じ方針）。

### 訳さないテンプレート

分類語を持たず製品名だけのものは**エントリを作らない**（英語フォールバックが
そのまま正解になる）。該当 100 件で、うち 85 件は火器。

```
Kurogane AR-77 / Neon Arms Stiletto .22 / Apex Thunderclap …
```

### 上流の不整合（英語側に従った）

日本語は英語にフォールバックする設計なので、仏英が食い違う場合は**英語に合わせる**。
報告候補として記録する。

| フランス語 | 英語 | 採用 |
| --- | --- | --- |
| `Lame monofilament`（刃） | `Monofilament Whip`（鞭） | `モノフィラメント・ウィップ` |
| `Grenades fumigènes`（発煙） | `Gas Grenades`（ガス） | `ガスグレネード` |
| `SteetHide`（綴り誤り） | `StreetHide` | `StreetHide` |
| `Proxénète : Velvet`（ポン引き） | `Fixer: Velvet`（フィクサー） | `フィクサー：ヴェルヴェット` |

食い違っているのは**分類語だけ**（刃か鞭か）で、`Monofilament` の部分は共通している。
訳語化して `単分子鞭` とはせず、カタカナの `モノフィラメント・ウィップ` を採る。
同じテーブルに `Chaîne monofilament`（`モノフィラメント・チェーン`）と
サイバーウェアの `Wuxing Serpent Monofilament Whip` があり、3 件を同じ語形で
揃える必要があるため。

`Proxénète` / `Fixer` は分類語ではなく**職業そのものが別**で、説明文
（「個人的なサービスと内密な情報の仲介」）はどちらとも取れる。英語に合わせたが、
どちらが意図なのかは上流に確認が必要。報告一覧は
[upstream-reports.md](upstream-reports.md)。

### 段階

| 段階 | 対象 | 分量 | 状態 |
| --- | --- | --- | --- |
| 第1段階 | 名前 1,886 件 | 原文 43,546 字 | **完了** |
| 第2段階 | 説明文 1,986 件（HTML 含む） | 原文 130,470 字 | **完了** |

名前の総数は 1,986 件だが、分類語を持たない 100 件はエントリを作らないので
対象は 1,886 件。説明文は名前と違い FR と EN が一致する件が無いため、
1,986 件すべてが対象になる。

### 第2段階（説明文）

説明文は名前と同じ French name キーを使うが、分量が一桁多いため別ファイル
（`src/module/config/npc-generator-descs-ja.ts`）に置く。同じファイルに入れると
差分の確認が現実的でなくなる。

説明文は**すべて `<p>` で囲まれた HTML** で、Foundry がアイテムシート上で
HTML として描画する。タグを落としても壊れた表示になるだけでエラーは出ないので、
`npc-generator-descs-ja.test.ts` が各エントリのタグ列を置き換え元の説明文と
比較する。この検査は 1 件をわざと壊して動作を確認した。

用語は ja.json に定義があるものはそれに従う（ダメージ、マトリックス、
コムリンク、ニュー円、ファイアウォール、レゾナンス、ドレイン、SIN、AR）。
定義が無いものはフォークの既存表記に揃える（ソイカフ、バレンズ、
メトロプレックス、第六世界、シャドウランナー、オリハルコン）。

第2段階の作業中に、第1段階の名前を 4 件修正した。

| 修正前 | 修正後 | 理由 |
| --- | --- | --- |
| `反動耐性` | `ドレイン耐性` | ja.json が `DRAIN_*` で「ドレイン」を使っている |
| `声の模倣` | `声の擬態` | `倣` は常用漢字外で環境により表示できない |
| `環境模倣` | `環境擬態` | 同上 |
| `ノード模倣` | `ノード擬態` | 同上 |

### カテゴリ別の方針

| カテゴリ | 件数 | 形 | 扱い |
| --- | --- | --- | --- |
| cyberware（バイオウェア含む） | 400 | 製品名＋分類語 | 分類語を訳す |
| equipment（通常装備） | 200 | 製品名＋分類語 | 分類語を訳す |
| equipment（魔法のフォーカス） | 108 | 魔術語＋修飾語 | 修飾語を訳し対象物はカタカナ／漢字 |
| weapon | 108 | 製品名＋分類語 | 和語優先（短刀・脇差・金棒ほか） |
| armor / cyberdeck | 80 | 製品名＋分類語 | 分類語を訳す |
| spell / adept-power / complex-form / trait | 785 | 能力名のみ | 全訳 |
| contact | 200 | 職業: 通り名 | 職業を訳し通り名は残す |
| awakened / emerged | 5 | 覚醒形態の記述 | 全訳 |

エントリの無いテンプレートは従来どおり英語にフォールバックするため、
**未訳でも壊れない**。生成済み NPC には遡及しない（名前は生成時に
アイテムデータとして書き込まれる）。

## 10. 日本語 CSS の状況

- `src/less/theme-mixins.less` の全フォント変数に CJK フォールバックを追加した。
  同梱テーマフォント（`sra2_foundry_*`）は Latin のみを収録しているため、
  これがないと日本語がグリフ単位でブラウザ既定フォントに落ちる。
- 固定幅は多い（`width|height: <n>px` が 256 箇所、`white-space: nowrap` が
  38 箇所）。**文字切れ・重なりの有無は Foundry 上での目視確認が必要** で、
  未確認のまま幅を変更すると英語・フランス語のレイアウトを壊すため手を付けていない。

### `check:layout` の精度について

`check:layout`（`tools/i18n/layout-risk.mjs`）は jsdom を使わない静的推定で、
ビルド済み CSS とテンプレートを突き合わせる。当初は CSS を**クラス名だけ**で
索引していたため、子孫セレクタのルールを無関係な場所に適用して
誤検出を出していた。

| 誤検出 | 原因 |
| --- | --- |
| 車両シートの武器マウント `<select>` が 40px（2 件） | 40px は `.sra2-character-sheet-v2 … .dice .attribute-input` のもの。この `<select>` はそのどれの中にも無い |
| `roll-result.hbs` の `.damage-label` が `nowrap`（5 件） | `nowrap` は車両シートの `.armor-thresholds-section .damage-tracking .damage-label` だけに付いている |

後者には `COMBAT.MATRIX_DAMAGE_LABEL` / `COMBAT.BIOFEEDBACK_DAMAGE_LABEL` など、
**目視確認リストの上位 3 件が含まれていた**。確認すべき箇所を実際より多く
見せていたことになる。

現在は祖先クラスの連なりも照合する。ただしテンプレートに現れないクラスは
Foundry が外側で付けるもの（Dialog の `.sra2.roll-dialog` など）なので、
照合の条件にしない。これを条件にすると、実行時には効いているルールを
取り落として**今度は見落とす**。

結果として、固定幅の中にあるラベルは 10 → 8、`nowrap` は 27 → 22 件。
「両方の言語で狭すぎる」は 2 → **0 件**になり、テスト側の許容リストも消えた。

### `i18n:hardcoded` の精度について

同じ問題が `i18n:hardcoded`（`tools/i18n/find-hardcoded.mjs`）にもあった。
候補 **2,125 件**のうち、実際に見るべきものは 6 件だった。

| 除外したもの | 件数 | 理由 |
| --- | --- | --- |
| NPC ジェネレーターのデータ表 | 1,907 | 内容物であって UI ではない。日本語は `npc-generator-*-ja.ts` にある |
| ロケールキーそれ自体 | 101 | `label: 'SRA2.FEATS.RATING'` は Foundry が訳す。指摘が逆向き |
| `console.warn` | — | 開発者向けログ。`Failed to …` の行はすべてこれ |
| SCREAMING_CASE の識別子 | 1 | `name: 'SRA2_BOOKMARKS'` は内部 ID。表示されるのは隣の `title` |

残った 6 件は `hardcoded-strings.test.ts` に**理由付きで列挙**してある。
新しい候補が出たらテストが落ちるので、読まれない山に埋もれない。

6 件のうち本当に直すべきものは **Dice So Nice のカラーセット名 2 件**で、
これは `en.json` / `fr.json` に新キーが必要なため上流案件
（[upstream-reports.md](upstream-reports.md) §9）。残り 4 件は表示されない
（未使用フィールド 3 件、フォルダ検索キー 1 件）。

## 11. フランス語版原書との用語突き合わせ（2026-10-01）

フランス語版基本ルールブック（322 ページ）を参照し、`fr.json` の用語が原書と
一致しているか、そこから日本語訳が正しい語に当たっているかを検証した。

### 方法と境界

**原文を repo に残していない。** PDF からテキストを抽出したのはセッション専用の
作業領域で、repo に入れたのは「用語が原書に存在するか」の判定結果と、
下に挙げた**単語**だけである。説明文・ルール本文は抽出もしていないし、
転記もしていない。`npc-generator-descs-ja.ts` のような説明文を原書から作る
作業は行わない（[upstream-reports.md](upstream-reports.md) の禁止事項）。

照合は機械的に行った。`fr.json` の値を正規化（行末ハイフン結合・小文字化）した
原書テキストに対して部分一致で検索し、一致しなかったものだけを人間が目で確認。

### 一致を確認した用語

| 対象 | 件数 | 結果 |
| --- | --- | --- |
| 能力値 5 種（`Force` / `Agilité` / `Volonté` / `Logique` / `Charisme`） | 5 | 全一致 |
| 技能名（`SRA2.NPC_GEN.SKILLS`） | 16 | **全 16 件が原書の表記どおり** |
| 専門化名（`SRA2.NPC_GEN.SPECS`、`Spé : ` を除いた本体） | 66 | 58 件一致。残り 8 件は原書が表組みで抽出が崩れた箇所 |
| CI の種別（`SRA2.ICE.TYPES`） | 8 | 全一致（`Patrouilleuse` / `Noire` など女性形まで一致） |
| アトウト種別（`SRA2.FEATS.FEAT_TYPE`） | 16 | 一致 |
| ダメージ段階（`Léger` / `Modéré` / `Grave` / `Incapacitant`） | 4 | 全一致 |
| コンプリケーション段階（`mineure` / `critique` / `Désastre`） | 3 | 全一致 |

技能 16 件が原書どおりだったことで、そこから訳した日本語（`近接戦闘` /
`隠密` / `クラッキング` ほか）が**正しい語を訳している**ことは確認できた。

### 原書で裏が取れた上流の不整合

§9「上流の不整合（英語側に従った）」の 4 件のうち、3 件は原書で判定できた。

| 件 | 原書の語 | 判定 |
| --- | --- | --- |
| `Lame monofilament`（刃）/ `Monofilament Whip`（鞭） | **`Fouet monofilament`**（鞭）。`Lame monofilament` は原書に無い | **仏名が誤り。英語に合わせた判断が正しい** |
| `Grenades fumigènes`（発煙）/ `Gas Grenades`（ガス） | **`Grenades à gaz`**。原書は発煙手榴弾とガス手榴弾を別物として扱う | **仏名が誤り。英語に合わせた判断が正しい** |
| `Proxénète : Velvet` / `Fixer: Velvet` | **どちらも原書に無い**。フィクサー相当のコネは `Intermédiaire` | 下記のとおり未決 |

`SteetHide` の綴り誤りは製品名なので原書には現れない（製品名そのものが上流の創作）。

`Velvet` については、原書の語彙では `Fixer` も `Proxénète` も使われていない
（原書のフィクサー系コネは `Intermédiaire`、ポン引きに当たるコネは存在しない）。
一方、同じテーブルの近くに `Recruteur du milieu : Broker`（runner と雇い主を
仲介する＝フィクサーの役割）と `Prostituée : Candy` が既にあり、`Proxénète` は
他に埋まっていない枠に収まる。つまり**仏名が意図で、英名 `Fixer` が誤りである
可能性が高い**が、確証ではない。現状の `フィクサー：ヴェルヴェット` を
`ポン引き：ヴェルヴェット` に変えるかは、語感の問題も含むため人間の判断に委ねる。

### 新たに見つかった不整合

いずれも `fr.json` / `en.json` 側の問題なので、**英語・フランス語は直さない**
（標準ルール）。報告候補に回した（[upstream-reports.md](upstream-reports.md)
§6 / §12〜§14）。ただし日本語側は原書に合わせられるので、`bus-truck` の
`バス／トラック` は `バス／セミトレーラー` に改めた（§8 の注記も更新済み）。
`glider-wing` の日本語は両方 `グライダー・ウィング` で既に一致しているため
変更不要。

| 内容 | 原書 |
| --- | --- |
| `SRA2.VEHICLE.TYPES.bus-truck` = `Bus / Camion` が `SRA2.FEATS.VEHICLE.TYPES.BUS_TRUCK` = `Bus / Semi-remorque` と食い違う | **`Bus / semi-remorque`**（2 箇所で同じ）。`FEATS` 側が正しい |
| `SRA2.VEHICLE.TYPES.glider-wing` = `Aile planante` が `FEATS` 側の `Aile volante` と食い違う | **`aile volante`**。`FEATS` 側が正しい（該当機体は `Artemis Industries Nightwing`、能力値も一致） |
| `Bâteau pneumatique semi-rigide` の綴り | **`Bateau`**（アクサン無し） |
| `SRA2.NPC_GEN.SPECS.spec_la-rue` の英語が `Spec: La rue`（フランス語のまま） | 原書の専門化は `la rue`。英語は `Street` が妥当。日本語の `ストリート` は正しい |

### 決定：`Anarchy` を採る（`Edge` ではない）

原書のリソースは **`point d'Anarchy`**（137 箇所）で、`Edge` は一度も出てこない。
`fr.json` もそれに従って `points d'Anarchy` / `Anarchy du Groupe` としている。
ところが `en.json` はこれを **`Edge`** / `Group Edge` に置き換えており、
日本語は英語にフォールバックする方針に従って `エッジ` / `グループ・エッジ` と
訳してある。

英語版が公式に `Edge` を使っているなら英語に合わせたままで正しく、
上流が独自に置き換えたのなら日本語は `アナーキー・ポイント` 側であるべき。
**手元にあるのはフランス語版だけなので、英語版の表記は確認できていない。**
日本語版の表記を参照して決めることは公式日本語版からの流用に当たるため行わない。

**判断：`アナーキー` を採る。** 根拠は、原書がこのリソースを一貫して
`point d'Anarchy` と呼び `Edge` を一度も使わないこと、および**ロケールキー自身が
`SRA2.ANARCHY_COUNTER` / `SRA2.RESOURCES.ANARCHY` / `BONUS_ANARCHY` と
`ANARCHY` で命名されている**こと。キー名は上流が表示文字列を `Edge` に
差し替える前の語を残しており、`Edge` が後からの置き換えであることを示している。
したがって日本語を英語にフォールバックさせる原則の**例外**として扱う。

語形は 2 つ。リソースそのものの正式名を `アナーキー・ポイント`、
ラベル・複合語では短い `アナーキー` を使う（原書も `Anarchy du Groupe` /
`Bonus d'Anarchy` のように `point` を省く）。

| キー | 変更前 | 変更後 |
| --- | --- | --- |
| `RESOURCES.ANARCHY` | `エッジ` | `アナーキー` |
| `RESOURCES.ANARCHY_BONUS_COMBAT` | `戦闘エッジ` | `戦闘アナーキー` |
| `RESOURCES.ANARCHY_TEMP` | `一時エッジ` | `一時アナーキー` |
| `RESOURCES.ANARCHY_SPENT` | `消費済みエッジ` | `消費済みアナーキー` |
| `ANARCHY_COUNTER.TITLE` / `.SETTING_NAME` | `グループ・エッジ` | `グループ・アナーキー` |
| `ANARCHY_COUNTER.ADD` / `.REMOVE` | `エッジを1点…` | `アナーキーを1点…` |
| `ANARCHY_COUNTER.SETTING_HINT` / `.GM_ONLY` | （同） | （同） |
| `FEATS.BONUS_ANARCHY` / `.BREAKDOWN.ANARCHY_BONUS` / `METATYPES.ANARCHY_BONUS` | `エッジ・ボーナス` | `アナーキー・ボーナス` |
| `FEATS.BONUS_ANARCHY_SHORT` | `エッジ` | `アナーキー` |
| `FEATS.BONUS_ANARCHY_HINT` / `METATYPES.ANARCHY_BONUS_HINT` | （同） | （同） |
| `TOOLTIP.ANARCHY_POINTS` | `エッジ・ポイント` | `アナーキー・ポイント` |

計 17 キー。`SETTINGS.THEME.SRA2`（製品名 `Shadowrun Anarchy 2`）は対象外。
`terminology.json` の `Edge` も `アナーキー` に改めた。SR の `エッジ` とは
別物なので、将来の作業者が元に戻さないよう `glossary-ja.md` に理由を残した。
`check:layout` では 17 キーいずれにも警告は出ていない。

### `ICE` / `IC`（§7 の裏付け）

原書の用語集は `glace`（女性名詞）を `contre-mesures d'intrusion` の略語 `CI` と
定義し、英語形として `IC`、その口語形として `ice` を併記している。
つまり `IC` が正式な略号であることは**原書自身が示している**一方、`ice` も
口語として認められた形であり、誤りではない。上流への報告は「誤りの指摘」ではなく
**表記統一の提案**として出すのが正確（報告一覧 §7 を同趣旨に修正済み）。

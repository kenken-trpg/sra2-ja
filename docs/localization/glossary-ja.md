# 用語対訳表（作業用）

機械可読な正データは `tools/i18n/terminology.json`。
本ファイルは判断の経緯を残すためのメモ。

| English | 日本語 | 備考 |
| --- | --- | --- |
| Edge | エッジ | SR 既存訳 |
| Attribute | 能力値 | SR 既存訳。「属性」は使わない |
| Dice Pool | ダイス・プール | 中黒あり |
| Critical Glitch | クリティカル・グリッチ | 幅が広いので固定幅UIに注意 |
| Anarchy Point | アナーキー・ポイント | SRA 固有 |
| Contact | コネ | SR 日本語版の訳に合わせる |
| Lifestyle | 生活水準 | |
| Quality | クォリティ | 「質」は避ける |
| Feat | フィート | SRA 固有。長さの単位と混同しない |
| SIN | SIN | 原文のまま |

## NPC ジェネレーターのラベル（`SRA2.NPC_GEN.*`）

技能・専門化・メタタイプ・アーキタイプ名は Compendium 側のアイテム名と
重複する語であり、Compendium 日本語化（`localization/ja-compendium`）を
進める際は**こちらの訳語と揃える**必要がある。

| English | 日本語 | 備考 |
| --- | --- | --- |
| Close Combat | 近接戦闘 | |
| Ranged Weapons | 遠隔武器 | |
| Cracking | クラッキング | 「ハッキング」と訳し分けない |
| Sorcery | 呪術 | |
| Conjuration | 召喚 | |
| Influence | 影響力 | |
| Spec: … | 専門化：… | 全角コロン。`Spécialisation` の略に対応 |
| Physical Adept | フィジカル・アデプト | |
| Elite Runner | エリート・ランナー | |

## 未決定

- `Complication` … 「コンプリケーション」で仮固定。訳語化する場合は要再検討。
- `SRA2.FEATS.WEAPON.RANGE_DICE` … 「ダイス」で仮置き。武器射程の選択肢
  （`none` / `ok` / `dice` / `disadvantage`）の一つだが、`dice` を参照する
  処理がコード上に存在せず、ルール上の意味を確認できていない。値名をそのまま
  写した暫定訳なので、ルールブックで挙動を確認してから確定する。
- `slug`（`SRA2.SKILLS.SLUG` / `SRA2.SPECIALIZATIONS.SLUG`）… 「識別子」。
  Compendium アイテムの照合キーで、ユーザーが自由に編集する値ではない。
- `Server` / `Host`（14 キー）… **要確認。現行の「サーバー / サーバー指数」を維持する。**
  キックスターター版プレビュー（英語）の目次は `Hosts 220` / `Hosts’ Defenses 221` /
  `> Host’s Ratings 222` で、`Server` という節は存在しない。一方で本文の地の文は
  `each second the hacker spends on a server is crucial` / `hacking a server` のように
  `server` を普通名詞として使っている。公式フランス語版（現時点で唯一の刊行物）は
  `Serveur`。つまり章題としての用語は `Host`、記述語としては `server` が併存する。
  `SRA2.ICE.SERVER_INDEX` が公式英語版の `Host’s Rating` に対応する可能性が高いが、
  該当ページ（p.220-222）はプレビューで削除されているため確定できない。
  英語版刊行後に再判定する。`server` は Actor のドキュメント型キーでもあるため、
  ラベルを変える場合もキーは変更しない。
- NPC ジェネレーターの技能・専門化名 … 上記で仮固定。Compendium の
  アイテム名を日本語化する場合、そちらと不一致にならないよう再確認する。

## SR5 用語集との突き合わせ（`npm run check:glossary`）

SRA2 は SR5 と語彙を共有するので、既存の SR5 訳と食い違う語は再確認の価値が
ある。ローカルの [`chummer-web`](https://github.com/kenken-trpg/chummer-web)
checkout にある SR5 用語集（`docs/translation-glossary.md`）と日本語
オーバーレイ（`backend/data/ja_overrides/data.json`）を、本フォークの
`en.json` / `ja.json` と突き合わせる。

```sh
npm run check:glossary              # ../chummer-web を見る
CHUMMER_WEB=/path/to/chummer-web npm run check:glossary
npm run check:glossary -- --summary # 件数だけ
```

出力は `docs/localization/local/crossref-sr5.md`。分類は
**相違** / **未訳** / **原文維持**（SR5 はラテン文字のまま） / **一致**。

### ライセンス上の注意（重要）

chummer-web の日本語データは chummer5a/chummer5a（**GPL-3.0**）の派生物であり、
本フォークは **CC BY-SA 4.0**（`LICENSE.md`）。GPL-3.0 の訳語をそのまま
`public/lang/ja.json` に写して再配布することは**ライセンス上の判断を要する**。

そのため本スクリプトは次の設計になっている。

- 出力先 `docs/localization/local/` は `.gitignore` 済み。**レポートはコミットしない。**
- `public/lang/` へは一切書き込まない。取り込みの自動化はしていない。
- chummer-web を vendoring しない。参照はローカル checkout のみ。

用途は**突き合わせと気付き**であって、訳語の取り込みではない。相違が出た語を
どう扱うかは人間の判断で、採用可否そのものも判断対象。これは chummer-web 自身が
`shadowrun5eja`（LICENSE なし）に対して採った方針（一致／相違マーカーのみを
記録し、訳語本体は収録しない）と同じ立場。

### 確定した語（プレビュー英語版で判定したもの）

キックスターター版プレビュー（英語）の記述に基づき、SR5 用語集との突き合わせを
待たずに確定したもの。**出典 PDF は本リポジトリに含めない**（手元参照のみ）。
**いずれも SR5 日本語版の訳語は参照していない**（ライセンス
上の注意を参照）。SRA2 自身の定義文だけを根拠にしている。

#### Threshold → 閾値（31 キー）

プレビューには用法が 2 つある。どちらも「超えるべき数値」であり、同一の訳語で
問題ない。

- **判定の目標値**: `comparing those to the threshold set by the game master.`
  `When hits match or exceed the threshold, it is a success`。難易度段階
  （Easy〜Extreme）に対応する閾値の表もある（数値は転記しない）。
  該当キー: `SRA2.ROLL_DIALOG.THRESHOLD`、`SRA2.NPC.THRESHOLD`、
  `SRA2.ICE.ATTRIBUTES.THRESHOLD`、`SRA2.COMBAT.USE_THRESHOLD` ほか。
- **負傷段階の境界値**: 作例に `physical wound thresholds are 6/9/12` という
  記述がある（強度と防具から算出）。該当キー: `SRA2.ARMOR_THRESHOLDS.*`、
  `SRA2.VEHICLE.DAMAGE_THRESHOLDS.*`、`SRA2.FEATS.BONUS_*_THRESHOLD` ほか。

> 旧記述の「4 箇所」は誤り。実際は 31 キー。

#### Speed / Handling → 速度 / ハンドリング

SRA2 の定義がプレビューに入っている（車両の能力値解説）。

- `Handling: The vehicle’s ability to handle fast and sharp curves. Used during chases.`
- `Speed: Combines speed and acceleration of the vehicle.`

**SRA2 の `Speed` は速度と加速を1つにまとめた能力値**で、SR5 の `Speed` とは
指すものが違う。したがってこれは用語の相違ではなく**文脈の相違**であり、
突き合わせの対象にならない。現行訳を維持する。

#### Firewall → ファイアウォール（略号 `FW` は 2 キー）

地の文での `firewall` は比喩表現が1件のみで、能力値としての定義は
プレビューに含まれない。ただし本フォークの扱いは原文から説明できる。

- `SRA2.COMBAT.APPLY_FIREWALL_REDUCTION` … **原文自身が略号**
  （en: `Apply FW reduction` / fr: `Appliquer réduction FW`）。ja の `FW低下を適用`
  は原文に忠実。
- `SRA2.FEATS.CYBERDECK.FIREWALL_SHORT` … 原文は `Firewall` だがキー名が
  `_SHORT` で、サイバーデッキの固定幅テーブル用。ここだけ `FW` にする。

残る 9 キーはすべて `ファイアウォール`。旧記述の「本フォークのみ略号」は
片方が原文由来なので不正確。

### 突き合わせで見つかった主な相違

現時点で **相違 82 / 一致 107 / 原文維持 18**。相手側の訳語は上記の理由で
ここには載せない（レポートをローカルで見ること）。

**現時点の決定: 相違 82 件はすべて保留し、本フォークの現行訳を維持する。**
ライセンス上の判断が未了であること（上記）に加え、下表の通り文脈の相違か
用語の相違かが確定していない語が多いため。再検討するときは、この表の
「論点」列を起点にする。

| English | 本フォーク | 論点 |
| --- | --- | --- |
| Armor / Armor Value | 防具 / 防具値 | SR5 側は別語。SRA2 は防具アイテムを指し、SR5 側は数値を指すので文脈が違う可能性 |
| Contact | コネ | SR 日本語版寄りの訳。SR5 側はカナ表記で割れている |
| Threshold | 閾値 | **確定・維持**（31 キー / 2 用法。下記「確定した語」参照） |
| Description | 説明 | 9 箇所。UI 語彙の文体差のみ |
| Damage | ダメージ | SR5 側は略号併記。SRA2 に DV の概念はない |
| Magic | 魔法 | 3 箇所。能力値名か分野名かで SR5 側と分かれる |
| Sorcery | 呪術 | NPC ジェネレーターの技能名。SR5 側と別語。上記の表と要整合 |
| Vehicle | 車両 | 本フォークは漢字、SR5 側はカナ |
| Speed / Handling | 速度 / ハンドリング | **確定・維持**（SRA2 の Speed は SR5 の別能力値。下記参照） |
| Firewall | ファイアウォール | **確定**。略号 `FW` は 2 キーのみ（下記参照） |
| Complex Form | コンプレックス・フォーム | 3 箇所。SR5 側は訳語化している |
| Emerged | 覚醒（テクノマンサー） | SR5 側は別語。括弧の補足が必要か要検討 |

※ `Light`（本フォーク「軽傷」）のように、同じ英単語が SR5 側では別の文脈を
指していて**相違ではない**行もある。スクリプトは英語ラベルの一致でしか
突き合わせられないので、文脈の判定は人が行う。

## Compendium の名称対訳（`npm run compendium:ja`）

宣言済みパック `anarchy-items-en`（技能 16・専門化 91・メタタイプ 5・フォルダ 3）
の名称のみを日本語化する。**説明文は 1 件も含まれないため、名称対訳以外の判断が
発生しない。** `packs.tgz` 側（feat 559・NPC 1903・説明文 203 件）は対象外で、
スクリプトが説明文を検出したら中止する。

訳語の 88/115 は `public/lang/{en,ja}.json` から引く。UI と Compendium の
不一致を構造的に防ぐためで、専用辞書は持たない。残り 25 件は
`tools/compendium/names-ja.json` が補完し、いずれも既存の ja.json 内の
パターンに従っている。

| 補完した語 | 日本語 | 準拠したパターン |
| --- | --- | --- |
| `Spec: Engineering` / `Stealth` / `Magic` | 専門化：工学 / 隠密 / 魔法 | 技能名の訳をそのまま使う |
| `Spec: Astral Stealth` | 専門化：アストラル隠密 | 物理隠密 / マトリックス隠密 |
| `Spec: C&R Mechanical Devices` | 専門化：機械装置整備 | ドローン整備 / 車両整備（C&R = 整備） |
| `Spec: Kin Spirits` / `Plant Spirits` | 専門化：同族の精霊 / 植物の精霊 | 大気の精霊 / 大地の精霊 / 火の精霊 |
| `Spec: Aquatic Drones` | 専門化：水中ドローン | 地上ドローン / 飛行ドローン |
| `Spec: Personal Electronics` | 専門化：個人用電子機器 | 個人用デバイス（`Personal Devices`）と区別 |

### 上流由来の気付き

- `Spec: La rue` … 英語パックにフランス語が残っている。本フォークは
  `ja.json` の「専門化：ストリート」を当てている
- `Spec: Matrix` / `Spec: Thrown Weapons` … 英語パック内で名称が重複している
- `Spec: Remote ConTrolled Weapons` / `Spec: monofilament` … 大文字小文字の誤り
- `npm run pack:compendiums` は新規パックを `system: "sra2"`（上流の ID）で
  `system.json` に自動追記する。本フォークでは ID 不一致になるため、生成
  スクリプトは `system.json` を触らず自己完結させている（`system-manifest`
  テストがこの不一致を検出する）

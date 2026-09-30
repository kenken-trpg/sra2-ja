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
- `Server` / `Host` … SRA2 の用法が SR5 と一致するか確認が必要。
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

### 突き合わせで見つかった主な相違

現時点で **相違 82 / 一致 107 / 原文維持 18**。相手側の訳語は上記の理由で
ここには載せない（レポートをローカルで見ること）。判断が必要な語は次の通り。

| English | 本フォーク | 論点 |
| --- | --- | --- |
| Armor / Armor Value | 防具 / 防具値 | SR5 側は別語。SRA2 は防具アイテムを指し、SR5 側は数値を指すので文脈が違う可能性 |
| Contact | コネ | SR 日本語版寄りの訳。SR5 側はカナ表記で割れている |
| Threshold | 閾値 | 4 箇所。SR5 側と別語。ルール用語として要確認 |
| Description | 説明 | 9 箇所。UI 語彙の文体差のみ |
| Damage | ダメージ | SR5 側は略号併記。SRA2 に DV の概念はない |
| Magic | 魔法 | 3 箇所。能力値名か分野名かで SR5 側と分かれる |
| Sorcery | 呪術 | NPC ジェネレーターの技能名。SR5 側と別語。上記の表と要整合 |
| Vehicle | 車両 | 本フォークは漢字、SR5 側はカナ |
| Speed / Handling | 速度 / ハンドリング | 車両ステータス。SR5 側は別語。SRA2 の定義を要確認 |
| Firewall | FW | 本フォークのみ略号。固定幅 UI の都合か要確認 |
| Complex Form | コンプレックス・フォーム | 3 箇所。SR5 側は訳語化している |
| Emerged | 覚醒（テクノマンサー） | SR5 側は別語。括弧の補足が必要か要検討 |

※ `Light`（本フォーク「軽傷」）のように、同じ英単語が SR5 側では別の文脈を
指していて**相違ではない**行もある。スクリプトは英語ラベルの一致でしか
突き合わせられないので、文脈の判定は人が行う。

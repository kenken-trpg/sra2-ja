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

# 上流への Issue / PR 下書き

[upstream-reports.md](../upstream-reports.md) の 18 項目を、上流
（`VincentVk9373/sra2`）にそのまま投稿できる形に起こした下書き。

**どれも未投稿。** 投稿するかどうか・いつ出すかは人間が決める。
本文は英語（上流の既存 PR #148 / #149 と同じ書き方）。各ファイルの
`---` より上は本フォーク用のメモで、投稿するのは `---` より下だけ。

確認した上流の木: `upstream/master` = `be3672c`（`v14.3.3`）。
行番号はすべてこの時点のもの。投稿前に上流が動いていないか確認し、
動いていたら行番号と再現手順を確かめ直す。

## 一覧

| ファイル | 種別 | 元の項目 | 上流での変更 | 状態 |
| --- | --- | --- | --- | --- |
| [issue-01-data-inconsistencies.md](issue-01-data-inconsistencies.md) | Issue | §2 §3 §4 §5 §6 §12 §13 §14 | なし（報告のみ） | 未投稿 |
| [issue-02-ice-term-and-dead-template.md](issue-02-ice-term-and-dead-template.md) | Issue | §7 §8 | なし（相談） | 未投稿・**§7 は文面を人間が確認** |
| [pr-01-item-search-locale-keys.md](pr-01-item-search-locale-keys.md) | PR | §1 | lang 3 + `item-search.ts` | 未投稿 |
| [pr-02-dice-so-nice-colorset-names.md](pr-02-dice-so-nice-colorset-names.md) | PR | §9 | lang 2 + `dice-so-nice.ts` | 未投稿 |
| [pr-03-npc-chat-summary-language.md](pr-03-npc-chat-summary-language.md) | PR | §16 §17 §18 | lang 2 + `npc-generator.ts` | 未投稿 |
| [pr-04-generated-npc-folder.md](pr-04-generated-npc-folder.md) | PR | §15 | lang 2 + `npc-generator.ts` + 新規 helper | 未投稿 |
| [pr-05-remove-tracked-artifacts.md](pr-05-remove-tracked-artifacts.md) | PR | §10 §11 | 削除のみ | 未投稿 |

## 出す順番の案

1. **既存の #148 / #149 に反応があるまで待つ。** 上流は 2026-09-02 以降 push が
   なく、こちらの PR 2 本が未レビューのまま。
2. 反応があったら、まず `issue-01`（修正を伴わない報告なので負担が軽い）。
3. 次に PR を 1 本ずつ。差分が小さい `pr-02` → `pr-01` → `pr-03` → `pr-05` → `pr-04`。
   `pr-04` は移行処理を含み、判断材料が一番多いので最後。

## PR を作るときの注意

- 本フォークの修正をそのまま持ち込まない。**本フォーク固有のもの**
  （`sra2-ja` の system id、`ja.json`、`npc-generator-data-ja.ts`、
  `needsLocaleText()` など日本語向けの分岐、フォーク独自のテスト）は除く。
- ブランチは `prfork`（`kenken-trpg/sra2`）に、`upstream/master` から切る。
  本フォークの `master` から切ると 80 件以上の無関係なコミットが乗る。
- フランス語の新規文言は本フォークで用意した仮のもの。PR 本文で
  「仏語は確認してほしい」と明記してある。
- ロケールキー名は本フォークと異なる場合がある（上流の既存の名前空間に
  合わせたため）。各ファイルのメモ欄に対応を書いた。

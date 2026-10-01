/**
 * Keeps `npm run i18n:hardcoded` honest. The scan is a heuristic, so its
 * value is entirely in staying small enough to read: every candidate is
 * listed below with why it is not something to translate, and a new one
 * fails this test rather than joining a pile nobody reads.
 *
 * The pile was real. Before the filters in find-hardcoded.mjs the scan
 * reported 2,125 candidates, of which 1,907 were the NPC generator's data
 * tables and 101 were locale keys passed to Foundry to localize.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

interface Hit {
  file: string;
  line: number;
  text: string;
}

/**
 * Every candidate the scan currently reports, and why it stays. None of
 * these can be fixed inside this fork: the first two need new keys in
 * en.json and fr.json, which is upstream's file, and the rest are not
 * display text at all. Recorded in docs/localization/upstream-reports.md.
 */
const ACCOUNTED_FOR: Record<string, string> = {
  // Shown in Dice So Nice's colorset picker, so genuinely user-facing.
  'SRA2 - Normal dice': 'upstream: needs a locale key before it can be translated',
  'SRA2 - Risk dice': 'upstream: needs a locale key before it can be translated',
  // `label` on the cyberdeck program table is never read; only `field` is.
  Biofeedback: 'dead field: the generator reads prog.field, never prog.label',
  'Biofeedback Filter': 'dead field: the generator reads prog.field, never prog.label',
  'Connection Lock': 'dead field: the generator reads prog.field, never prog.label',
  // Both the name of the folder created and the predicate that finds it
  // again, so translating it would orphan the folders already created, in
  // every language.
  Generated: 'lookup key as well as a folder name; shared with en and fr',
};

let hits: Hit[];

beforeAll(async () => {
  // A computed specifier: the tool is plain .mjs with no type declarations.
  const tool = pathToFileURL(
    path.resolve(__dirname, '../../..', 'tools/i18n/find-hardcoded.mjs'),
  ).href;
  const { scan } = await import(/* @vite-ignore */ tool);
  hits = scan(path.resolve(__dirname, '../..')) as Hit[];
});

describe('hard-coded string scan', () => {
  it('reports no candidate that is not accounted for', () => {
    const unexplained = hits
      .filter((h) => !(h.text in ACCOUNTED_FOR))
      .map((h) => `${h.file}:${h.line} "${h.text}"`);
    expect(unexplained).toEqual([]);
  });

  it('keeps the accounted-for list from going stale', () => {
    const found = new Set(hits.map((h) => h.text));
    const gone = Object.keys(ACCOUNTED_FOR).filter((t) => !found.has(t));
    expect(gone).toEqual([]);
  });

  it('does not count a locale key as a hard-coded string', () => {
    // item-feat.ts is nothing but DataModel fields labelled with locale keys.
    expect(hits.filter((h) => h.file.includes('item-feat'))).toEqual([]);
  });
});

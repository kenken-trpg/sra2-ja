/**
 * Keeps `npm run i18n:hardcoded` honest. The scan is a heuristic, so its
 * value is entirely in staying small enough to read: it now reports nothing,
 * and a new candidate fails this test rather than joining a pile nobody
 * reads.
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
 * Candidates the scan reports that are deliberately not locale keys, with
 * the reason each one stays. Empty: the last six were resolved by
 * SRA2.DICE_SO_NICE.{NORMAL,RISK} and SRA2.NPC_GENERATOR.FOLDER, by dropping
 * the cyberdeck program table's unread `label`, and the folder lookup still
 * matches an existing untranslated "Generated" folder.
 */
const ACCOUNTED_FOR: Record<string, string> = {};

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

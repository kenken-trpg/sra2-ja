/**
 * Guards the Japanese labels against the layout the English ones were built
 * for. The analysis lives in tools/i18n/layout-risk.mjs, which pairs the
 * built CSS with the templates; see its header for what the estimate can and
 * cannot know. Run `npm run check:layout` for the full report.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

interface Finding {
  key: string;
  file: string;
  ja: string;
  enW: number;
  jaW: number;
  avail: number;
  box: { cls: string; px: number };
}

interface Report {
  sites: number;
  constrained: number;
  regressions: Finding[];
  preexisting: Finding[];
  nowrapGrowth: { key: string; growth: number }[];
}

/**
 * Boxes too narrow for English as well, so this fork did not introduce them.
 * A 40px select cannot show its own option text in any language. Listed so a
 * *new* one is not lost among them; fixing the CSS is what removes an entry.
 */
const UPSTREAM_TOO_NARROW = new Set([
  'SRA2.VEHICLE.WEAPON_MOUNT_NONE',
  'SRA2.VEHICLE.WEAPON_MOUNT_RIFLE',
]);

let report: Report;

beforeAll(async () => {
  // A computed specifier: the tool is plain .mjs with no type declarations.
  const tool = pathToFileURL(
    path.resolve(__dirname, '../../..', 'tools/i18n/layout-risk.mjs'),
  ).href;
  const { analyze } = await import(/* @vite-ignore */ tool);
  report = analyze('ja') as Report;
});

const describeFinding = (f: Finding): string =>
  `${f.key} in ${f.file}: .${f.box.cls} gives ${f.avail.toFixed(0)}px,` +
  ` en needs ${f.enW.toFixed(0)}px and ja needs ${f.jaW.toFixed(0)}px ("${f.ja}")`;

describe('Japanese label layout budget', () => {
  it('still has something to measure', () => {
    // If the CSS or templates move, the analysis must not pass by finding
    // nothing at all.
    expect(report.sites).toBeGreaterThan(800);
    expect(report.constrained).toBeGreaterThan(0);
    expect(report.nowrapGrowth.length).toBeGreaterThan(0);
  });

  it('never overflows a fixed-width box that fits the English label', () => {
    expect(report.regressions.map(describeFinding)).toEqual([]);
  });

  it('reports no box too narrow for both languages beyond the known ones', () => {
    const unexpected = report.preexisting
      .filter((f) => !UPSTREAM_TOO_NARROW.has(f.key))
      .map(describeFinding);
    expect(unexpected).toEqual([]);
  });

  it('keeps the upstream-too-narrow list accurate', () => {
    const flagged = new Set(report.preexisting.map((f) => f.key));
    const stale = [...UPSTREAM_TOO_NARROW].filter((k) => !flagged.has(k));
    expect(stale).toEqual([]);
  });
});

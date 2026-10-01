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

let report: Report;
/* eslint-disable @typescript-eslint/no-explicit-any */
let indexCss: (css: string) => Map<string, any[]>;
let matchRule: (rule: any, stack: string[][], i: number, outside?: Set<string>) => boolean;

beforeAll(async () => {
  // A computed specifier: the tool is plain .mjs with no type declarations.
  const tool = pathToFileURL(
    path.resolve(__dirname, '../../..', 'tools/i18n/layout-risk.mjs'),
  ).href;
  const mod = await import(/* @vite-ignore */ tool);
  report = mod.analyze('ja') as Report;
  indexCss = mod.indexCss;
  matchRule = mod.matchRule;
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

  it('reports no box too narrow for both languages', () => {
    // There was an allowlist of two here, the vehicle sheet's weapon-mount
    // select. Both were artefacts of indexing the CSS by class alone: the
    // 40px belongs to `.sra2-character-sheet-v2 … .dice .attribute-input`,
    // which that select is not inside. The analysis now checks the ancestors,
    // so a finding here is a real box again and the list is empty.
    expect(report.preexisting.map(describeFinding)).toEqual([]);
  });
});

describe('CSS indexing', () => {
  it('does not apply a descendant rule outside its ancestor chain', () => {
    const css = '.sheet .dice .attribute-input{width:40px}';
    const index = indexCss(css);
    const stack = (...classes: string[][]) => classes;

    const inside = stack(['sheet'], ['dice'], ['attribute-input']);
    const outside = stack(['sheet'], ['other'], ['attribute-input']);
    const rule = index.get('attribute-input')![0];

    expect(matchRule(rule, inside, 2)).toBe(true);
    expect(matchRule(rule, outside, 2)).toBe(false);
  });

  it('does not require an ancestor class that no template carries', () => {
    // Foundry wraps a Dialog's template in its own markup, so a rule scoped
    // to that wrapper still applies to what the template renders.
    const index = indexCss('.roll-dialog .header .label{white-space:nowrap}');
    const rule = index.get('label')![0];
    const stack = [['header'], ['label']];

    expect(matchRule(rule, stack, 1)).toBe(false);
    expect(matchRule(rule, stack, 1, new Set(['roll-dialog']))).toBe(true);
  });

  it('ignores a rule whose subject carries a pseudo-class', () => {
    expect(indexCss('.box:hover{width:40px}').get('box')).toBeUndefined();
  });
});

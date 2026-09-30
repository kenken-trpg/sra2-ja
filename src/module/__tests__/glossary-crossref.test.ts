/**
 * Covers the matching rules of tools/i18n/glossary-crossref.mjs. The tool
 * itself reads a chummer-web checkout that is not part of this repository or
 * of CI, so only the pure functions are exercised here.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

let normalize: (s: string) => string;
let isTermLike: (s: string) => boolean;

beforeAll(async () => {
  // A computed specifier: the tool is plain .mjs with no type declarations.
  const tool = pathToFileURL(
    path.resolve(__dirname, '../../..', 'tools/i18n/glossary-crossref.mjs'),
  ).href;
  ({ normalize, isTermLike } = await import(/* @vite-ignore */ tool));
});

describe('glossary cross-reference matching', () => {
  it.each([
    ['Armor', 'armor'],
    ['Damage:', 'damage'],
    ['Damage：', 'damage'],
    ['(Melee)', 'melee'],
    ['Weapons & Armor', 'weapons and armor'],
    ['  Dice   Pool  ', 'dice pool'],
  ])('folds %j to %j for lookup', (input, expected) => {
    expect(normalize(input)).toBe(expected);
  });

  it.each(['Armor', 'Damage:', 'Ranged Weapons', 'Complex Form'])(
    'treats %j as a term worth looking up',
    (label) => {
      expect(isTermLike(label)).toBe(true);
    },
  );

  it.each([
    ['A', 'a single character is not a term'],
    ['{type} created', 'a format string is a template, not a term'],
    ['This IC type cannot attack.', 'a sentence is not a term'],
    ['the first feat marker was moved from another feat to this one', 'too long to be a term'],
  ])('rejects %j (%s)', (label) => {
    expect(isTermLike(label)).toBe(false);
  });
});

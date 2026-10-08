import { afterEach, describe, expect, it, vi } from 'vitest';
import { pickOne } from '../helpers/random.js';

afterEach(() => vi.restoreAllMocks());

describe('pickOne', () => {
  it('rejects an empty table instead of returning undefined', () => {
    expect(() => pickOne([])).toThrow(RangeError);
  });

  it.each([0, 0.5, 1 - Number.EPSILON])('selects an in-bounds entry at random = %s', (random) => {
    vi.spyOn(Math, 'random').mockReturnValue(random);
    const table = ['first', 'middle', 'last'] as const;
    expect(pickOne(table)).toBe(table[Math.floor(random * table.length)]);
    expect(table).toEqual(['first', 'middle', 'last']);
  });

  it('accepts a single entry', () => {
    expect(pickOne(['only'])).toBe('only');
  });
});

/** Choose an entry, failing explicitly if a caller supplies an empty table. */
export function pickOne<T>(array: readonly T[]): T {
  if (array.length === 0) {
    throw new RangeError('Cannot choose from an empty table');
  }
  // Math.random() is in [0, 1), so this index is in bounds for a nonempty table.
  return array[Math.floor(Math.random() * array.length)]!;
}

import { rewriteItemSource } from '../helpers/upstream-paths.js';

/**
 * Custom Item document for SRA2
 */
export class SRA2Item extends Item {
  /**
   * Migrate legacy item types before validation.
   * Runs before the document schema is validated, so invalid types can be fixed.
   */
  static override migrateData(source: any): any {
    // Legacy "race" type → "metatype"
    if (source.type === 'race') {
      source.type = 'metatype';
    }
    // Images of data made under upstream `sra2` point at systems/sra2/.
    rewriteItemSource(source);
    return super.migrateData(source);
  }
}

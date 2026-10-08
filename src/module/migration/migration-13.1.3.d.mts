/** Public interface of the legacy JavaScript migration. */
export class Migration_13_1_3 {
  get code(): string;
  get version(): string;
  migrate(): Promise<void>;
}

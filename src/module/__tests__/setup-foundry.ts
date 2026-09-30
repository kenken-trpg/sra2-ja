/**
 * A minimal stand-in for the Foundry globals that this system touches while a
 * module is being evaluated.
 *
 * Several data models extend `foundry.abstract.TypeDataModel` at class-
 * definition time, so merely importing a helper that transitively reaches one
 * throws `ReferenceError: foundry is not defined` before any test body runs.
 * Defining the globals here keeps the production code untouched.
 *
 * This is deliberately not a Foundry emulation: it makes the class bodies
 * evaluate. A test that needs real behaviour from one of these must mock it
 * itself.
 */

/** Records the schema its subclass declares, so a test can inspect it. */
class TypeDataModelStub {
  static defineSchema(): Record<string, unknown> {
    return {};
  }

  constructor(source: Record<string, unknown> = {}) {
    Object.assign(this, source);
  }
}

/** A field records its options; DataModel schemas are read, not exercised. */
const field =
  (type: string) =>
  (...args: unknown[]) => ({ fieldType: type, options: args[0] ?? {} });

const foundryStub = {
  abstract: {
    TypeDataModel: TypeDataModelStub,
    DataModel: TypeDataModelStub,
  },
  data: {
    fields: {
      StringField: field('string'),
      NumberField: field('number'),
      BooleanField: field('boolean'),
      ArrayField: field('array'),
      SchemaField: field('schema'),
      ObjectField: field('object'),
      HTMLField: field('html'),
      FilePathField: field('filePath'),
      DocumentIdField: field('documentId'),
    },
  },
  utils: {
    mergeObject: (a: object, b: object) => ({ ...a, ...b }),
    deepClone: <T>(v: T): T => structuredClone(v),
    randomID: () => 'testid0000000000',
  },
};

/** Sheet and dialog classes extend these bare globals at definition time. */
class ApplicationStub {
  static get defaultOptions(): Record<string, unknown> {
    return {};
  }
}

Object.assign(globalThis, {
  foundry: foundryStub,
  // Referenced through the deprecated bare globals in a few places.
  Application: ApplicationStub,
  ApplicationV2: ApplicationStub,
  FormApplication: ApplicationStub,
  Dialog: ApplicationStub,
  ItemSheet: ApplicationStub,
  ActorSheet: ApplicationStub,
  Roll: class {},
  ChatMessage: class {},
});

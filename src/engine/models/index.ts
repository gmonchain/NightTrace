/**
 * The model barrel (the engine contract `02` §H): consumers import from one
 * place, and later stories extend it without touching an importer.
 *
 * These are the only types the layers above the core are allowed to reach: the
 * Content layer may import `engine/models` and nothing else from the engine
 * (AD-1's `ENGINE_MODELS_ONLY`), and the Shell imports them freely.
 */
export * from './brand';
export * from './ids';
export * from './seed';
export * from './phase';
export * from './digest';
export * from './event';
export * from './directive';
export * from './content';
export * from './emission';

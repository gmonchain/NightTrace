/**
 * The engine's content bundle — the shapes the schedulers read, in one object.
 *
 * The engine may not import `src/data/**` (AD-1), so content arrives as a
 * dependency. This type is the seam: it lives in `engine/models` (which the
 * Content layer *may* import), so `src/data/content.ts` can build the bundle
 * without reaching into an engine stage, and `createInvestigationEngine` reads
 * it without a cast.
 */

import type { SessionDirective } from './directive';
import type { EventDefinition, EventTable } from './event';

/** The three content collections a session needs. Grows additively per story. */
export interface EngineContent {
  readonly definitions: readonly EventDefinition[];
  readonly tables: readonly EventTable[];
  readonly directives: readonly SessionDirective[];
}

/**
 * The directive seam — `DEFAULT_DIRECTIVE` and the `SessionDirective` shape
 * (the engine contract `02` §H.3, AD-6).
 *
 * The *shape* itself lives in `engine/models/directive.ts` and is re-exported
 * here, because the Content layer may import `engine/models` and nothing else
 * from the engine (AD-1) and the authored directive pool is content. This
 * module supplies the neutral baseline a session runs under before any authored
 * directive fires.
 */

import { directiveId, type SessionDirective } from '../models';

export type {
  GuaranteedEncounter,
  GuaranteedEncounterReason,
  SessionDirective,
} from '../models';

/**
 * The neutral directive: a session that carries no editorial authority runs
 * under this. Silence scale 1 (no change), no bans, no guaranteed arcs, no
 * ceiling. It is never *emitted* — it is the state the directive scheduler
 * starts in, before the first authored directive fires.
 */
export const DEFAULT_DIRECTIVE: SessionDirective = {
  id: directiveId('default'),
  text: '',
  guaranteedEncounters: [],
  bannedEvents: [],
  silenceScale: 1,
  tensionCeiling: 100,
  minimumDurationMs: null,
  allowEarlyEncounter: false,
  flavourNote: null,
};

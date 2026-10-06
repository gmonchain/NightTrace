// Fixture: a *relative* import from the pure core into the Shell. The route and
// layer rules must match relative specifiers as well as the `@/` alias, so this
// must be rejected by AD-1's `no-restricted-imports`. Importing the engine's own
// `./models/…` remains legal (proved by a lintText case in the boundary test).
import { Logger } from '../../services/Logger';

export const log = Logger;

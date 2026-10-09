/**
 * The content version constant (AD-3).
 *
 * A content bump is the one event that breaks replay parity, and it does so
 * knowingly. Because this value is one of the `SeedParts` that feed the seed
 * hash, the break is structural: the same night on a newer content version
 * derives a different seed, deliberately, instead of silently replaying against
 * tables that no longer exist.
 *
 * It lives in the Content layer, which may import `engine/models` and nothing
 * else from the engine — matching the existing ESLint `CONTENT_BAN`. Bumping it
 * is a deliberate, dated act: `'YYYY.MM.DD.N'`.
 */

import { contentVersion, type ContentVersion } from '@/engine/models';

export const CONTENT_VERSION: ContentVersion = contentVersion('2026.10.05.1');

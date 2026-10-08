import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { ENTERTAINMENT_LINE } from '@/data/strings';

/**
 * Story 1.7 — EXPORT_OBLIGATION.
 *
 * The matrix row: "a named artifact records that any data export must carry the
 * entertainment notice". Epic 6's export story (`6-4-…`) is told to follow "the
 * obligation recorded in Story 1.7", so the obligation has to be findable: this
 * asserts the artifact exists and names both FR-27 and the entertainment line,
 * so it cannot be quietly dropped before the export story reads it.
 */

const ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const OBLIGATION = path.join(ROOT, 'docs', 'epic-6-export-obligation.md');

describe('the Epic 6 export obligation (EXPORT_OBLIGATION)', () => {
  it('is a named artifact the Epic 6 story can find', () => {
    expect(existsSync(OBLIGATION)).toBe(true);
  });

  it('records that any export must carry the entertainment notice, per FR-27', () => {
    const text = readFileSync(OBLIGATION, 'utf8');
    expect(text).toContain('FR-27');
    // It names the export obligation explicitly.
    expect(text.toLowerCase()).toContain('export');
    expect(text.toLowerCase()).toContain('entertainment notice');
  });

  it('names the entertainment line exactly, as the exported constant', () => {
    const text = readFileSync(OBLIGATION, 'utf8');
    expect(text).toContain(ENTERTAINMENT_LINE);
  });
});

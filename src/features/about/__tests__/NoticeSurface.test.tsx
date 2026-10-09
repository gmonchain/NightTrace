import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { ABOUT_NOTICE, ABOUT_NOTICE_COPY, ENTERTAINMENT_LINE } from '@/data/strings';
import {
  find,
  flatten,
  mergedStyle,
  textContent,
  type HostElement,
} from '@/ui/components/__tests__/tree';
import { spacing, typography } from '@/ui/theme/tokens';

import { NoticeSurface } from '../NoticeSurface';

/**
 * Story 1.7 — the About notice rendered.
 *
 * The matrix rows proved here: FULL_NOTICE (every section, the sensor
 * inventory, the entertainment line, the safety paragraph), SAFETY_LEGIBLE (the
 * safety paragraph at or above the mono floor, not truncated, not reworded) and
 * CLOSE_ABOUT (the close action dismisses). The content is Story 1.5's table, so
 * every assertion compares the rendered text to the table — a reworded or
 * truncated string fails.
 */

/** The paragraph the SENSORS USED section derives from the sensor rows. */
function sensorSection(): (typeof ABOUT_NOTICE.sections)[number] {
  const section = ABOUT_NOTICE.sections.find((entry) =>
    entry.paragraphs.some((paragraph) =>
      paragraph.includes(ABOUT_NOTICE.sensorNote),
    ),
  );
  if (section === undefined) {
    throw new Error('no SENSORS USED section in the notice table');
  }
  return section;
}

/** Every direct string child of every element, in render order. */
function renderedStrings(root: HostElement | null): readonly string[] {
  const out: string[] = [];
  for (const element of flatten(root)) {
    for (const child of element.children) {
      if (typeof child === 'string') {
        out.push(child);
      }
    }
  }
  return out;
}

/** The Text node whose rendered content is exactly `value`. */
function textNodeWith(root: HostElement | null, value: string): HostElement {
  const node = find(
    root,
    (element) => element.type === 'Text' && textContent(element) === value,
  );
  if (node === undefined) {
    throw new Error(`no Text node rendered "${value}"`);
  }
  return node;
}

function renderSurface() {
  const onClose = vi.fn();
  return render(<NoticeSurface onClose={onClose} />).then((result) => ({
    onClose,
    ...result,
  }));
}

describe('NoticeSurface renders the notice in full (FULL_NOTICE)', () => {
  it('renders the notice title', async () => {
    const { getByText } = await renderSurface();
    expect(getByText(ABOUT_NOTICE.title)).toBeTruthy();
  });

  it('renders every section heading, in the table’s order', async () => {
    const { toJSON } = await renderSurface();
    const strings = renderedStrings(toJSON());
    const expected = ABOUT_NOTICE.sections.map((section) => section.heading);

    // Presence, each exactly once.
    for (const heading of expected) {
      expect(strings.filter((value) => value === heading)).toHaveLength(1);
    }
    // Order: the headings appear as a subsequence in table order.
    const positions = expected.map((heading) => strings.indexOf(heading));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it('renders every authored paragraph, bite for bite (never truncated, never reworded)', async () => {
    const { toJSON } = await renderSurface();
    const strings = renderedStrings(toJSON());
    const sensors = sensorSection();

    for (const section of ABOUT_NOTICE.sections) {
      if (section === sensors) {
        continue;
      }
      for (const paragraph of section.paragraphs) {
        expect(strings).toContain(paragraph);
      }
    }
  });

  it('renders the sensor inventory as rows (each sensor and its note)', async () => {
    const { getByText, getAllByText } = await renderSurface();
    for (const row of ABOUT_NOTICE.sensors) {
      expect(getByText(row.sensor)).toBeTruthy();
      // The note is the same on every row, so every row renders it.
      expect(getAllByText(row.note)).toHaveLength(ABOUT_NOTICE.sensors.length);
    }
    expect(ABOUT_NOTICE.sensors.length).toBeGreaterThan(0);
  });

  it('renders the imported entertainment line exactly once, and it is the constant', async () => {
    expect(ABOUT_NOTICE.entertainmentLine).toBe(ENTERTAINMENT_LINE);
    const { toJSON } = await renderSurface();
    const strings = renderedStrings(toJSON());
    expect(strings.filter((value) => value === ENTERTAINMENT_LINE)).toHaveLength(1);
  });

  it('puts the safety content in the SAFETY section, whole', async () => {
    const safety = ABOUT_NOTICE.sections.find(
      (section) => section.heading === 'SAFETY',
    );
    expect(safety).toBeDefined();
    const safetyText = safety?.paragraphs.join(' ') ?? '';
    // The ratified safety content: photosensitivity, sudden audio, startle.
    expect(safetyText).toMatch(/distortions/i);
    expect(safetyText).toMatch(/suddenly/i);
    expect(safetyText).toMatch(/startle/i);

    const { getByText } = await renderSurface();
    for (const paragraph of safety?.paragraphs ?? []) {
      expect(getByText(paragraph)).toBeTruthy();
    }
  });
});

describe('the safety paragraph is legible (SAFETY_LEGIBLE)', () => {
  const safety = ABOUT_NOTICE.sections.find(
    (section) => section.heading === 'SAFETY',
  );
  const safetyParagraph = safety?.paragraphs.join(' ') ?? '';

  it('renders at or above the mono floor', async () => {
    const { toJSON } = await renderSurface();
    // One paragraph holds the whole safety content today; assert each one is at
    // or above the floor.
    for (const paragraph of safety?.paragraphs ?? []) {
      const node = textNodeWith(toJSON(), paragraph);
      const fontSize = mergedStyle(node).fontSize;
      expect(typeof fontSize).toBe('number');
      expect(fontSize as number).toBeGreaterThanOrEqual(typography.micro.fontSize);
    }
  });

  it('is neither truncated nor reworded', async () => {
    const { toJSON } = await renderSurface();
    // The rendered Text's content equals the table's paragraph byte for byte.
    const node = textNodeWith(toJSON(), safetyParagraph);
    expect(textContent(node)).toBe(safetyParagraph);
  });
});

describe('NoticeSurface close action (CLOSE_ABOUT)', () => {
  it('exposes a labelled close button that dismisses the notice', async () => {
    const { getByLabelText, onClose } = await renderSurface();
    const close = getByLabelText(ABOUT_NOTICE_COPY.closeLabel);
    expect(close.props.accessibilityRole).toBe('button');

    fireEvent.press(close);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('NoticeSurface keeps the notice reachable (never truncated)', () => {
  it('wraps the title and sections in a scroll container with the close action outside it', async () => {
    const { toJSON } = await renderSurface();
    const root = toJSON();
    const scroll = find(
      root,
      (element) => element.props.testID === 'about-notice-scroll',
    );
    expect(scroll).toBeDefined();
    if (scroll === undefined) {
      throw new Error('no scroll container');
    }

    // The title — and therefore the sections that follow it — live inside the
    // scroll, so the safety content is scrollable rather than overflowing.
    const inside = flatten(scroll);
    const title = find(
      root,
      (element) =>
        element.type === 'Text' && textContent(element) === ABOUT_NOTICE.title,
    );
    expect(title).toBeDefined();
    expect(inside).toContain(title);

    // The close action is *not* inside the scroll: it is pinned outside it and
    // stays reachable however tall the notice gets.
    const close = find(
      root,
      (element) =>
        element.props.accessibilityLabel === ABOUT_NOTICE_COPY.closeLabel,
    );
    expect(close).toBeDefined();
    expect(inside).not.toContain(close);
  });

  it('applies the top safe-area inset so the notice is not under a notch', async () => {
    const { toJSON } = await render(
      <SafeAreaInsetsContext.Provider
        value={{ top: 59, bottom: 34, left: 0, right: 0 }}
      >
        <NoticeSurface onClose={() => {}} />
      </SafeAreaInsetsContext.Provider>,
    );
    const root = toJSON();
    expect(root === null ? null : mergedStyle(root).paddingTop).toBe(59);
    // The frame's own bottom padding still comes from the token scale.
    expect(root === null ? null : mergedStyle(root).paddingBottom).toBe(
      spacing['4'],
    );
  });
});

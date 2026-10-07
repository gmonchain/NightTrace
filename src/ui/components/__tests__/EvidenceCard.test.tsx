import { act, fireEvent, render } from '@testing-library/react-native';

import { animations, colors, rounded } from '../../theme/tokens';
import {
  EVIDENCE_AUTO_DISMISS_MS,
  EVIDENCE_CERTAINTIES,
  EVIDENCE_OUTCOMES,
  EvidenceCard,
} from '../EvidenceCard';
import { find, mergedStyle, setReduceMotion, spyOnTiming, styleProps } from './tree';

const CARD = {
  typeLabel: 'FRAME',
  channel: 'Camera · captured',
  possibleMatch: 'No match on file',
} as const;

describe('EvidenceCard', () => {
  it('shows a type label, the three-row word-only meta block and the two actions', async () => {
    const { getByText, toJSON } = await render(
      <EvidenceCard
        {...CARD}
        certainty="SUGGESTIVE"
        onResolve={() => {}}
      />,
    );
    expect(getByText('FRAME')).toBeTruthy();
    expect(getByText('Certainty')).toBeTruthy();
    expect(getByText('SUGGESTIVE')).toBeTruthy();
    expect(getByText('Channel')).toBeTruthy();
    expect(getByText('Camera · captured')).toBeTruthy();
    expect(getByText('Possible match')).toBeTruthy();
    expect(getByText('No match on file')).toBeTruthy();
    expect(getByText('Keep')).toBeTruthy();
    expect(getByText('Mark as explained')).toBeTruthy();

    // Certainty is a band word, never a number, and no countdown is rendered.
    const rendered = JSON.stringify(toJSON());
    expect(rendered).not.toContain('%');
  });

  it('accepts each certainty band', async () => {
    for (const certainty of EVIDENCE_CERTAINTIES) {
      const { getByText } = await render(
        <EvidenceCard {...CARD} certainty={certainty} onResolve={() => {}} />,
      );
      expect(getByText(certainty)).toBeTruthy();
    }
  });

  it('draws the evidence-card surface on its border at its radius', async () => {
    const { toJSON } = await render(
      <EvidenceCard
        {...CARD}
        certainty="AMBIGUOUS"
        onResolve={() => {}}
      />,
    );
    const root = toJSON();
    if (root === null) {
      throw new Error('no tree');
    }
    expect(mergedStyle(root)).toMatchObject({
      backgroundColor: colors.ledger,
      borderColor: colors.rule,
      borderRadius: rounded.DEFAULT,
    });
  });

  it('CAPTURE_ACTIONS: Keep resolves `kept` exactly once and dismisses', async () => {
    const onResolve = jest.fn();
    const { getByText, queryByText } = await render(
      <EvidenceCard
        {...CARD}
        certainty="COMPELLING"
        onResolve={onResolve}
      />,
    );
    await fireEvent(getByText('Keep'), 'press');
    expect(onResolve).toHaveBeenCalledTimes(1);
    expect(onResolve).toHaveBeenCalledWith('kept');
    expect(queryByText('Keep')).toBeNull();
  });

  it('CAPTURE_ACTIONS: Mark as explained resolves `explained` exactly once and dismisses', async () => {
    const onResolve = jest.fn();
    const { getByText, queryByText } = await render(
      <EvidenceCard
        {...CARD}
        certainty="AMBIGUOUS"
        onResolve={onResolve}
      />,
    );
    await fireEvent(getByText('Mark as explained'), 'press');
    expect(onResolve).toHaveBeenCalledTimes(1);
    expect(onResolve).toHaveBeenCalledWith('explained');
    expect(queryByText('Mark as explained')).toBeNull();
  });

  it('a resolved card never fires a second callback', async () => {
    const onResolve = jest.fn();
    const { getByText } = await render(
      <EvidenceCard {...CARD} certainty="AMBIGUOUS" onResolve={onResolve} />,
    );
    const keep = getByText('Keep');
    await fireEvent(keep, 'press');
    await fireEvent(keep, 'press');
    expect(onResolve).toHaveBeenCalledTimes(1);
  });

  it('a reused instance handed a new item resolves it', async () => {
    const onResolve = jest.fn();
    const { getByText, queryByText, rerender } = await render(
      <EvidenceCard {...CARD} certainty="AMBIGUOUS" onResolve={onResolve} />,
    );
    await fireEvent(getByText('Keep'), 'press');
    expect(onResolve).toHaveBeenCalledTimes(1);
    expect(onResolve).toHaveBeenCalledWith('kept');
    expect(queryByText('Keep')).toBeNull();

    // The same instance, handed the next item, is a fresh card: it can resolve
    // again rather than staying permanently dismissed.
    await rerender(
      <EvidenceCard
        typeLabel="EVP"
        certainty="COMPELLING"
        channel="Audio · captured live"
        possibleMatch="No match on file"
        onResolve={onResolve}
      />,
    );
    expect(getByText('EVP')).toBeTruthy();
    await fireEvent(getByText('Mark as explained'), 'press');
    expect(onResolve).toHaveBeenCalledTimes(2);
    expect(onResolve).toHaveBeenLastCalledWith('explained');
  });

  it('reports the three outcomes as a closed set', () => {
    expect(EVIDENCE_OUTCOMES).toEqual(['kept', 'explained', 'unreviewed']);
  });

  it('as a capture card, enters on ntUp with a safelight progress hairline', async () => {
    const restore = setReduceMotion(false);
    const spy = spyOnTiming();
    try {
      const { toJSON } = await render(
        <EvidenceCard {...CARD} certainty="AMBIGUOUS" capture onResolve={() => {}} />,
      );
      await act(async () => {
        await Promise.resolve();
      });
      // Each captured config is paired with the animation that received it: the
      // entrance animates to rest (`toValue` 0) and the hairline to full
      // (`toValue` 1), so a swapped duration fails.
      const configs = spy.configs();
      const entrance = configs.find((config) => config.toValue === 0);
      const hairline = configs.find((config) => config.toValue === 1);
      expect(entrance?.duration).toBe(animations.ntUp.durationMs);
      expect(hairline?.duration).toBe(EVIDENCE_AUTO_DISMISS_MS);
      // The dwell window is the six seconds the design source names.
      expect(EVIDENCE_AUTO_DISMISS_MS).toBe(6000);

      const root = toJSON();
      if (root === null) {
        throw new Error('no tree');
      }
      // The progress hairline's bar is safelight.
      expect(
        find(root, (element) =>
          styleProps(element).some(
            (style) => style.backgroundColor === colors.safelight,
          ),
        ),
      ).toBeDefined();
    } finally {
      spy.timing.mockRestore();
      restore();
    }
  });

  it('a bare evidence card has no progress hairline', async () => {
    const { toJSON } = await render(
      <EvidenceCard {...CARD} certainty="AMBIGUOUS" onResolve={() => {}} />,
    );
    const root = toJSON();
    if (root === null) {
      throw new Error('no tree');
    }
    expect(
      find(root, (element) =>
        styleProps(element).some(
          (style) => style.backgroundColor === colors.safelight,
        ),
      ),
    ).toBeUndefined();
  });

  it('CAPTURE_AUTODISMISS: reports `unreviewed` and dismisses when left alone', async () => {
    const restore = setReduceMotion(false);
    const spy = spyOnTiming();
    jest.useFakeTimers();
    try {
      const onResolve = jest.fn();
      const { queryByText } = await render(
        <EvidenceCard {...CARD} certainty="AMBIGUOUS" capture onResolve={onResolve} />,
      );
      expect(queryByText('Keep')).toBeTruthy();
      expect(onResolve).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(EVIDENCE_AUTO_DISMISS_MS);
      });
      expect(onResolve).toHaveBeenCalledTimes(1);
      expect(onResolve).toHaveBeenCalledWith('unreviewed');
      expect(queryByText('Keep')).toBeNull();
    } finally {
      jest.useRealTimers();
      spy.timing.mockRestore();
      restore();
    }
  });

  it('drops the capture entrance and the hairline under Reduce Motion but still dismisses', async () => {
    const restore = setReduceMotion(true);
    const spy = spyOnTiming();
    jest.useFakeTimers();
    try {
      const onResolve = jest.fn();
      const { queryByText, toJSON } = await render(
        <EvidenceCard {...CARD} certainty="AMBIGUOUS" capture onResolve={onResolve} />,
      );
      await act(async () => {
        await Promise.resolve();
      });
      expect(spy.timing).not.toHaveBeenCalled();

      // The branch still renders the card visible for its whole window.
      const root = toJSON();
      if (root === null) {
        throw new Error('no tree');
      }
      expect(mergedStyle(root).opacity).toBe(1);

      await act(async () => {
        jest.advanceTimersByTime(EVIDENCE_AUTO_DISMISS_MS);
      });
      expect(onResolve).toHaveBeenCalledWith('unreviewed');
      expect(queryByText('Keep')).toBeNull();
    } finally {
      jest.useRealTimers();
      spy.timing.mockRestore();
      restore();
    }
  });
});

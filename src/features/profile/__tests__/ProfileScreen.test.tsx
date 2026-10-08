import { fireEvent, render } from '@testing-library/react-native';

import { PROFILE_COPY } from '@/data/strings';
import { find, flatten, type HostElement } from '@/ui/components/__tests__/tree';

import { ProfileScreen } from '../ProfileScreen';

/**
 * Story 1.7 — the Profile destination and its About row (OPEN_ABOUT).
 *
 * The row must be a **normal destination**, not a hidden or developer gesture:
 * a single labelled button a user can tap. These assertions pin that the screen
 * exposes exactly one control — the About row — and that pressing it opens the
 * notice.
 */

function buttons(root: HostElement | null): readonly HostElement[] {
  return flatten(root).filter(
    (element) => element.props.accessibilityRole === 'button',
  );
}

describe('ProfileScreen', () => {
  it('renders the Profile title and the About row', async () => {
    const { getByText } = await render(<ProfileScreen onOpenAbout={() => {}} />);
    expect(getByText(PROFILE_COPY.title)).toBeTruthy();
    expect(getByText(PROFILE_COPY.aboutRowLabel)).toBeTruthy();
  });

  it('OPEN_ABOUT: the About row opens the notice', async () => {
    const onOpenAbout = jest.fn();
    const { getByLabelText } = await render(
      <ProfileScreen onOpenAbout={onOpenAbout} />,
    );
    fireEvent.press(getByLabelText(PROFILE_COPY.aboutRowLabel));
    expect(onOpenAbout).toHaveBeenCalledTimes(1);
  });

  it('exposes the About row as one ordinary, labelled control', async () => {
    const { toJSON } = await render(<ProfileScreen onOpenAbout={() => {}} />);
    const controls = buttons(toJSON());
    expect(controls).toHaveLength(1);
    expect(controls[0]?.props.accessibilityLabel).toBe(
      PROFILE_COPY.aboutRowLabel,
    );
    // It is not hidden from assistive technology — a normal destination.
    expect(controls[0]?.props.accessibilityElementsHidden).not.toBe(true);
    expect(controls[0]?.props.importantForAccessibility).not.toBe(
      'no-hide-descendants',
    );
  });

  it('marks the trailing chevron decorative', async () => {
    const { toJSON } = await render(<ProfileScreen onOpenAbout={() => {}} />);
    const chevron = find(
      toJSON(),
      (element) => element.props.accessibilityElementsHidden === true,
    );
    expect(chevron).toBeDefined();
  });
});

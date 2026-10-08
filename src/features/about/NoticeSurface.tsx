import { useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import {
  ABOUT_NOTICE,
  ABOUT_NOTICE_COPY,
  ABOUT_NOTICE_SENSOR_HEADING,
} from '@/data/strings';
import { Rule } from '@/ui/components';
import { colors, components, rounded, spacing, typography } from '@/ui/theme/tokens';
import { textStyle } from '@/ui/theme/type';

/**
 * `NoticeSurface` — the About notice, rendered in full from Story 1.5's table.
 *
 * This component authors **no** notice content: every heading, every paragraph,
 * every sensor row and the entertainment line come straight from `ABOUT_NOTICE`
 * (`src/data/strings/aboutNotice.ts`). The content is Story 1.5's source of
 * truth; the one content risk the intent names — "never reworded" — is therefore
 * a rendering property, and the suite asserts the rendered text equals the
 * table's (byte for byte, so nothing is truncated or reworded).
 *
 * Structure, top to bottom: the notice title, then the six sections in
 * §B.5 order, each ruled by a `Rule` and set through `textStyle` so every step
 * reads from the type ramp. The `SENSORS USED` section renders the structured
 * `ABOUT_NOTICE.sensors` inventory as rows rather than its derived prose summary
 * — the summary is `${inventory} — ${note}` built from those same rows, so
 * printing both would show the inventory twice. Every other section renders its
 * paragraphs verbatim; the entertainment line (an imported constant, never
 * retyped) is one of them.
 *
 * The title and the sections live in a **`ScrollView`**; the close action sits
 * **outside** it. On a short device or at large Dynamic Type the notice content
 * scrolls rather than overflowing, so the safety paragraphs stay readable, and
 * the close action stays pinned and reachable instead of sliding off-screen.
 * The top safe-area inset is applied above the scroll (the Story 1.6
 * `OnboardingFrame` convention, read from `SafeAreaInsetsContext` with a zero
 * fallback), so the top of the notice is not under a notch and the clipped edge
 * of the scroll is below it. The section gap rides on the scroll's
 * `contentContainerStyle`.
 *
 * The sensor inventory section is identified **structurally**: its heading is the
 * table's exported `ABOUT_NOTICE_SENSOR_HEADING`, matched directly, so a section
 * whose prose merely mentions the sensor note is never mistaken for the
 * inventory.
 *
 * The safety paragraph is rendered like any other paragraph, so it sits at
 * `prose-small` (15px) — comfortably above the 9.5px mono floor the design
 * source sets — and is neither truncated nor reworded (the table's string, whole).
 *
 * The close action is the *composing route's*: the surface takes `onClose` and
 * never navigates itself (the Story 1.4 `Sheet` convention — a presentational
 * component does not own dismissal). No permission is requested and no sensor is
 * read anywhere here.
 */

export type NoticeSurfaceProps = {
  /** Dismiss the notice — the route owns the navigation back to Profile. */
  readonly onClose: () => void;
};

const titleStyle = textStyle(typography.heading);
const headingStyle = textStyle(typography.label);
const paragraphStyle = textStyle(typography['prose-small']);
const sensorNameStyle = textStyle(typography['prose-small']);
const sensorNoteStyle = textStyle(typography.meta);
const closeLabelStyle = textStyle(typography.label);

/**
 * Whether a section is the sensor inventory, identified **structurally** by its
 * heading: the `SENSORS USED` section is the one the table heads with the
 * exported `ABOUT_NOTICE_SENSOR_HEADING`. Matching the heading rather than a
 * substring of the paragraph means a section whose prose merely mentions the
 * sensor note is never mistaken for the inventory — and because the table heads
 * its section with the same constant, the surface cannot drift from it.
 */
function isSensorSection(heading: string): boolean {
  return heading === ABOUT_NOTICE_SENSOR_HEADING;
}

export function NoticeSurface({
  onClose,
}: NoticeSurfaceProps): React.JSX.Element {
  // Read the insets from the context so a surface rendered outside a provider
  // resolves to zero rather than throwing (the Story 1.4 / Story 1.6 convention).
  const insets = useContext(SafeAreaInsetsContext);
  const topInset = insets?.top ?? 0;

  return (
    <View style={[styles.surface, { paddingTop: topInset }]}>
      <ScrollView
        testID="about-notice-scroll"
        style={styles.scroll}
        // The section gap lives on the content, not the frame, so the content
        // scrolls as one column.
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text accessibilityRole="header" style={[titleStyle, styles.title]}>
          {ABOUT_NOTICE.title}
        </Text>

        {ABOUT_NOTICE.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Rule />
            <Text style={[headingStyle, styles.heading]}>
              {section.heading}
            </Text>
            {isSensorSection(section.heading) ? (
              <View style={styles.sensors}>
                {ABOUT_NOTICE.sensors.map((row) => (
                  <View key={row.sensor} style={styles.sensorRow}>
                    <Text style={[sensorNameStyle, styles.paragraph]}>
                      {row.sensor}
                    </Text>
                    <Text style={[sensorNoteStyle, styles.note]}>
                      {row.note}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              section.paragraphs.map((paragraph, index) => (
                // The index is part of the key so a repeated paragraph cannot
                // collide its key.
                <Text
                  key={`${index}-${paragraph}`}
                  style={[paragraphStyle, styles.paragraph]}
                >
                  {paragraph}
                </Text>
              ))
            )}
          </View>
        ))}
      </ScrollView>

      {/* The close action is outside the scroll, so it stays pinned and
          reachable however tall the notice content gets. */}
      <View style={styles.action}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={ABOUT_NOTICE_COPY.closeLabel}
          onPress={onClose}
          style={styles.close}
        >
          <Text style={[closeLabelStyle, styles.closeLabel]}>
            {ABOUT_NOTICE_COPY.closeLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    // `flexGrow`/`flexShrink` with the default `auto` basis — not `flex: 1` —
    // so a sheet that gives the surface no fixed height keeps the content's own
    // height rather than collapsing the scroll to zero.
    flexGrow: 1,
    flexShrink: 1,
    // A little breathing room under the close action, at the sheet's edge.
    paddingBottom: spacing['4'],
  },
  scroll: {
    // Claims any spare height and gives it up when constrained, so the sections
    // scroll inside the frame while the action below stays pinned.
    flexGrow: 1,
    flexShrink: 1,
  },
  scrollContent: {
    // The section gap rides the scrolled content, not the frame.
    gap: spacing['4'],
  },
  title: {
    color: colors.bone,
  },
  section: {
    gap: spacing['2'],
  },
  heading: {
    color: colors.ash,
  },
  paragraph: {
    color: colors.prose,
  },
  sensors: {
    gap: spacing['1'],
  },
  sensorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing['3'],
    justifyContent: 'space-between',
  },
  note: {
    color: colors.ash,
  },
  action: {
    paddingTop: spacing['4'],
  },
  close: {
    alignItems: 'center',
    borderColor: colors['rule-strong'],
    borderRadius: rounded.DEFAULT,
    borderWidth: components.rule.height,
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['4'],
  },
  closeLabel: {
    color: colors.bone,
  },
});

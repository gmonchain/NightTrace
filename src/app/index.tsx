import { StyleSheet, Text, View } from 'react-native';

/**
 * Launch placeholder. The onboarding flow (Story 1.6) and the four-tab shell
 * (Story 1.8) replace this; Story 1.1 only proves the app launches.
 *
 * No colour, dimension or duration token is hard-coded here — the design
 * system arrives in Story 1.2 (`src/ui/theme/tokens.ts`).
 */
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NightTrace</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
  },
});

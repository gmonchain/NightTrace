import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * The three build profiles (ARCHITECTURE-SPINE.md, Deployment & environments).
 * They differ ONLY in bundle/package id suffix, display name, and signing
 * identity. Supplying a signature here is deliberately absent: there is no
 * environment with different runtime behaviour, because there is nothing to
 * point at (no backend, no network call).
 */
type AppVariant = 'dev' | 'preview' | 'production';

const BUNDLE_BASE = 'com.nighttrace.app';

const VARIANT_SUFFIX: Readonly<Record<AppVariant, string>> = {
  dev: '.dev',
  preview: '.preview',
  production: '',
};

const VARIANT_DISPLAY_NAME: Readonly<Record<AppVariant, string>> = {
  dev: 'NightTrace Dev',
  preview: 'NightTrace Preview',
  production: 'NightTrace',
};

function resolveVariant(raw: string | undefined): AppVariant {
  if (raw === 'preview' || raw === 'production' || raw === 'dev') {
    return raw;
  }
  // Default to `dev` and never throw: an unrecognised APP_VARIANT must not
  // produce a production-signed binary by accident. A typo is a misconfiguration
  // worth surfacing, so it warns; the resolved default keeps the failure
  // direction safe. (The fastlane lanes are stricter and fail loudly, because
  // there a bad value signs the wrong binary rather than merely naming it.)
  if (raw !== undefined) {
    console.warn(
      `[app.config.ts] Unrecognised APP_VARIANT ${JSON.stringify(raw)}; ` +
        'falling back to "dev". Expected dev | preview | production.',
    );
  }
  return 'dev';
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = resolveVariant(process.env.APP_VARIANT);
  const idSuffix = VARIANT_SUFFIX[variant];

  return {
    ...config,
    name: VARIANT_DISPLAY_NAME[variant],
    slug: 'nighttrace',
    scheme: 'nighttrace',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    ios: {
      bundleIdentifier: `${BUNDLE_BASE}${idSuffix}`,
      appleTeamId: '8A9HSYWCS6',
      deploymentTarget: '16.4',
      supportsTablet: false,
      // The highest-risk shipped strings AD-16 names: an iOS purpose string
      // sits beside the field reading it explains, so each is part of the claims
      // lint's declared surface set. Declaring a purpose string is not requesting
      // a permission — the OS prompts only when the tool that needs the sensor is
      // opened, so zero-permission playability is untouched. The set covers every
      // sensor the About notice's SENSORS USED inventory names (Microphone,
      // Motion, Camera, Location), so the notice never overstates the binary.
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSMotionUsageDescription:
          'Motion is used only while a session is open, to let the field respond to how you move. It never leaves this device.',
        NSMicrophoneUsageDescription:
          'The microphone is used only while you record audio within a session. Recordings stay on this device.',
        NSCameraUsageDescription:
          'The camera is used only while you capture a frame within a session. Images stay on this device.',
        NSLocationWhenInUseUsageDescription:
          'Location is used only while a session is open, to place your night on the map of your place. It never leaves this device.',
      },
    },
    android: {
      package: `${BUNDLE_BASE}${idSuffix}`,
      // The Android manifest analogues of those purpose strings. A declared
      // permission is not a requested one: nothing is asked for until the tool
      // that needs it is opened.
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.ACTIVITY_RECOGNITION',
        'android.permission.CAMERA',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
    },
    experiments: {
      typedRoutes: true,
      // Required for the `@/*` -> `src/*` tsconfig path alias to resolve in
      // Metro at runtime, not only in tsc.
      tsconfigPaths: true,
    },
    plugins: [
      'expo-router',
      'expo-dev-client',
      [
        'expo-build-properties',
        {
          // Android compile/target SDK are expo-build-properties options, NOT
          // `expo.android` keys (AD-23 store floor: target API 36).
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
          },
        },
      ],
    ],
  };
};

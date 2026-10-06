// Fixture: an audio module under the pure core. Must be rejected by AD-1's
// `no-restricted-imports`; playback belongs to the shell/presenter.
//
// The epics acceptance criterion names "a haptic call, an audio play, a SQLite
// write and a ViewShot.capture call" as the four attempted inside src/engine/**,
// and a trigram search for its own wording would not find this fixture.
import * as Audio from 'expo-audio';

export function play(): void {
  Audio.setAudioModeAsync({ playsInSilentMode: true });
}

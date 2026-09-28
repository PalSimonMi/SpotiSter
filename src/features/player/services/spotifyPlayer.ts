import { NativeModules, Platform } from "react-native";

interface SpotifyNativePlayerModule {
  playTrack(uri: string): Promise<void>;
}

const spotifyNativePlayer =
  NativeModules.SpotifyNativePlayer as SpotifyNativePlayerModule | undefined;

export async function playSpotifyTrack(uri: string): Promise<void> {
  if (Platform.OS !== "android") {
    throw new Error("Spotify native playback is currently Android-only.");
  }

  if (!/^spotify:track:[A-Za-z0-9]{22}$/.test(uri)) {
    throw new Error("Invalid Spotify track.");
  }

  if (!spotifyNativePlayer?.playTrack) {
    throw new Error(
      "Spotify native playback is unavailable. Rebuild the Android app."
    );
  }

  await spotifyNativePlayer.playTrack(uri);
}
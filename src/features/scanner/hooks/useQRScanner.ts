import { useRef, useState } from "react";
import { parseSpotifyTrack } from "../services/qrParser";
import { resolveCardById, resolveSpotifyTrack } from "../services/cardApi";
import { playSpotifyTrack } from "../../player/services/spotifyPlayer";

function getSpotifyTrackUri(value: string): string | null {
  const parsedTrack = parseSpotifyTrack(value);
  if (parsedTrack) return parsedTrack.uri;

  return /^[A-Za-z0-9]{22}$/.test(value)
    ? `spotify:track:${value}`
    : null;
}

export function useQRScanner() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("Scan a card ID or Spotify track QR code.");
  const lastScanRef = useRef("");

  async function handleScan(data: string) {
    const input = data.trim();

    if (isProcessing || input === lastScanRef.current) {
      return;
    }

    lastScanRef.current = input;

    const track = parseSpotifyTrack(input);

    if (!track && !/^[A-Za-z0-9_-]{1,128}$/.test(input)) {
      setMessage("That is not a valid card ID or Spotify track QR code.");
      return;
    }

    setIsProcessing(true);
    setMessage("Starting playback...");

    try {
      let resolvedCard = null;
      let playbackUri: string | null = null;

      if (track) {
        try {
          resolvedCard = await resolveSpotifyTrack(track.id);
        } catch {}

        const spotifyDestination = resolvedCard?.destinations.find(
          (destination) => destination.provider.toLowerCase() === "spotify"
        );
        playbackUri = spotifyDestination
          ? getSpotifyTrackUri(spotifyDestination.value)
          : track.uri;
      } else {
        resolvedCard = await resolveCardById(input);
        if (!resolvedCard) {
          throw new Error(`Card "${input}" was not found on the server.`);
        }

        const spotifyDestination = resolvedCard.destinations.find(
          (destination) => destination.provider.toLowerCase() === "spotify"
        );
        playbackUri = spotifyDestination
          ? getSpotifyTrackUri(spotifyDestination.value)
          : null;

        if (!playbackUri) {
          throw new Error(
            `Card "${resolvedCard.id}" has no valid Spotify destination.`
          );
        }
      }

      if (!playbackUri) {
        throw new Error("The scanned code has no valid Spotify track.");
      }

      await playSpotifyTrack(playbackUri);
      setMessage("Playback started.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to start Spotify playback."
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return {
    isProcessing,
    message,
    handleScan,
  };
}
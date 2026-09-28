import { useRef, useState } from "react";
import { parseSpotifyTrack } from "../services/qrParser";
import { playSpotifyTrack } from "../../player/services/spotifyPlayer";

export function useQRScanner() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("Point the camera at a Spotify track QR code.");
  const lastScanRef = useRef("");
  const lastScanTimeRef = useRef(0);

  async function handleScan(data: string) {
    const now = Date.now();

    if (isProcessing) {
      return;
    }

    if (
      data === lastScanRef.current &&
      now - lastScanTimeRef.current < 3000
    ) {
      return;
    }

    lastScanRef.current = data;
    lastScanTimeRef.current = now;

    const track = parseSpotifyTrack(data);

    if (!track) {
      setMessage("That is not a supported Spotify track QR code.");
      return;
    }

    setIsProcessing(true);
    setMessage("Starting playback...");

    try {
      await playSpotifyTrack(track.uri);
      setMessage("Playing on Spotify.");
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
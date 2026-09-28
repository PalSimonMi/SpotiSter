import { TrackInfo } from "../../../shared/types";

const SPOTIFY_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

export function parseSpotifyTrack(value: string): TrackInfo | null {
  const input = value.trim();

  const uriMatch = input.match(/^spotify:track:([A-Za-z0-9]{22})$/i);

  if (uriMatch && SPOTIFY_ID_PATTERN.test(uriMatch[1])) {
    const id = uriMatch[1];

    return {
      id,
      uri: `spotify:track:${id}`,
    };
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(input);
  } catch {
    return null;
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (
    parsedUrl.protocol !== "https:" ||
    (hostname !== "open.spotify.com" && hostname !== "www.open.spotify.com")
  ) {
    return null;
  }

  const segments = parsedUrl.pathname.split("/").filter(Boolean);

  if (segments.length !== 2 || segments[0].toLowerCase() !== "track") {
    return null;
  }

  const id = segments[1];

  if (!SPOTIFY_ID_PATTERN.test(id)) {
    return null;
  }

  return {
    id,
    uri: `spotify:track:${id}`,
  };
}
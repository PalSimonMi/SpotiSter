export type MusicProvider = "spotify" | "youtube"; // ready for future

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface TrackInfo {
  id: string;
  uri: string;
  name?: string;
  artist?: string;
}
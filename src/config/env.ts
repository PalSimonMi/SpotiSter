export const ENV = {
  SPOTIFY_CLIENT_ID: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? "",
  SPOTIFY_REDIRECT_URI: "spotister://callback",
  CARD_API_URL: process.env.EXPO_PUBLIC_CARD_API_URL ?? "",
};
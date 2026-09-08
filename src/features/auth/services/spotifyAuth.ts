import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { ENV } from "../../../config/env";
import { SPOTIFY } from "../../../config/constants";
import { AuthTokens } from "../../../shared/types";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: SPOTIFY.AUTH_ENDPOINT,
  tokenEndpoint: SPOTIFY.TOKEN_ENDPOINT,
};

export async function loginWithSpotify(): Promise<AuthTokens | null> {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "spotister",
    path: "callback",
  });
  console.log("Actual redirect URI:", redirectUri);

  const authRequest = new AuthSession.AuthRequest({
    clientId: ENV.SPOTIFY_CLIENT_ID,
    scopes: SPOTIFY.SCOPES,
    redirectUri,
    usePKCE: true,
  });

  const result = await authRequest.promptAsync(discovery);

  if (result.type !== "success" || !result.params.code) {
    return null;
  }

  const tokenResult = await AuthSession.exchangeCodeAsync(
    {
      clientId: ENV.SPOTIFY_CLIENT_ID,
      code: result.params.code,
      redirectUri,
      extraParams: {
        code_verifier: authRequest.codeVerifier || "",
      },
    },
    discovery
  );

  const tokens: AuthTokens = {
    accessToken: tokenResult.accessToken,
    refreshToken: tokenResult.refreshToken ?? "",
    expiresAt: Date.now() + (tokenResult.expiresIn ?? 3600) * 1000,
  };

  await SecureStore.setItemAsync("spotify_tokens", JSON.stringify(tokens));
  return tokens;
}

export async function getStoredTokens(): Promise<AuthTokens | null> {
  const raw = await SecureStore.getItemAsync("spotify_tokens");
  if (!raw) return null;

  const tokens: AuthTokens = JSON.parse(raw);

  // Simple expiry check (we’ll improve this later)
  if (Date.now() >= tokens.expiresAt) {
    return null;
  }

  return tokens;
}

export async function logout() {
  await SecureStore.deleteItemAsync("spotify_tokens");
}
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { ENV } from "../../../config/env";
import { SPOTIFY } from "../../../config/constants";
import { AuthTokens } from "../../../shared/types";

WebBrowser.maybeCompleteAuthSession();

const TOKEN_STORAGE_KEY = "spotify_tokens";

const discovery = {
  authorizationEndpoint: SPOTIFY.AUTH_ENDPOINT,
  tokenEndpoint: SPOTIFY.TOKEN_ENDPOINT,
};

function getRedirectUri() {
  return AuthSession.makeRedirectUri({
    native: ENV.SPOTIFY_REDIRECT_URI,
  });
}

async function saveTokens(tokens: AuthTokens) {
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

export async function loginWithSpotify(): Promise<AuthTokens | null> {
  const redirectUri = getRedirectUri();

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
        code_verifier: authRequest.codeVerifier ?? "",
      },
    },
    discovery
  );

  const tokens: AuthTokens = {
    accessToken: tokenResult.accessToken,
    refreshToken: tokenResult.refreshToken ?? "",
    expiresAt: Date.now() + (tokenResult.expiresIn ?? 3600) * 1000,
  };

  await saveTokens(tokens);
  return tokens;
}

export async function getStoredTokens(): Promise<AuthTokens | null> {
  const raw = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  const tokens: AuthTokens = JSON.parse(raw);

  if (Date.now() < tokens.expiresAt - 60_000) {
    return tokens;
  }

  if (!tokens.refreshToken) {
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    return null;
  }

  const refreshed = await AuthSession.refreshAsync(
    {
      clientId: ENV.SPOTIFY_CLIENT_ID,
      refreshToken: tokens.refreshToken,
    },
    discovery
  );

  const updatedTokens: AuthTokens = {
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
    expiresAt: Date.now() + (refreshed.expiresIn ?? 3600) * 1000,
  };

  await saveTokens(updatedTokens);
  return updatedTokens;
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getStoredTokens();
  return tokens?.accessToken ?? null;
}

export async function logout() {
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
}
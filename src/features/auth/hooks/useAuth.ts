import { useState, useEffect, useCallback } from "react";
import { AuthState } from "../types";
import { getStoredTokens, loginWithSpotify, logout as spotifyLogout } from "../services/spotifyAuth";
import { AuthTokens } from "../../../shared/types";

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    tokens: null,
  });

  const loadTokens = useCallback(async () => {
    try {
      const tokens = await getStoredTokens();
      setState({
        isAuthenticated: !!tokens,
        isLoading: false,
        tokens,
      });
    } catch {
      setState({ isAuthenticated: false, isLoading: false, tokens: null });
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  const login = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const tokens = await loginWithSpotify();
    setState({
      isAuthenticated: !!tokens,
      isLoading: false,
      tokens,
    });
  };

  const logout = async () => {
    await spotifyLogout();
    setState({ isAuthenticated: false, isLoading: false, tokens: null });
  };

  return {
    ...state,
    login,
    logout,
  };
}
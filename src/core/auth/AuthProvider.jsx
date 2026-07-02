import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { authApi, decodeToken } from "./authApi";
import { tokenStorage } from "./tokenStorage";

export const AuthContext = createContext(null);

// Owns the session lifecycle: sign-in/out, silent refresh ahead of access
// token expiry, session restore on reload, and multi-tab synchronization
// (signing out in one tab signs out every tab via the `storage` event).
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const refreshTimer = useRef(null);

  const adoptSession = useCallback((session) => {
    tokenStorage.setAccessToken(session.accessToken);
    tokenStorage.setRefreshToken(session.refreshToken);
    tokenStorage.setSession({ user: session.user });
    setUser(session.user);

    const payload = decodeToken(session.accessToken);
    const msUntilRefresh = Math.max((payload?.exp ?? 0) - Date.now() - 60 * 1000, 30 * 1000);
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      silentRefresh();
    }, msUntilRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(() => {
    clearTimeout(refreshTimer.current);
    tokenStorage.clear();
    setUser(null);
  }, []);

  const silentRefresh = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      signOut();
      return null;
    }
    try {
      const session = await authApi.refresh(refreshToken);
      adoptSession(session);
      return session;
    } catch {
      signOut();
      return null;
    }
  }, [adoptSession, signOut]);

  // Restore the session once on mount.
  useEffect(() => {
    (async () => {
      if (tokenStorage.getRefreshToken()) {
        await silentRefresh();
      }
      setIsRestoring(false);
    })();
    return () => clearTimeout(refreshTimer.current);
  }, [silentRefresh]);

  // Multi-tab synchronization.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== tokenStorage.sessionStorageKey) return;
      if (!event.newValue) {
        clearTimeout(refreshTimer.current);
        tokenStorage.setAccessToken(null);
        setUser(null);
      } else {
        silentRefresh();
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [silentRefresh]);

  const signIn = useCallback(
    async (credentials) => {
      const session = await authApi.signIn(credentials);
      adoptSession(session);
      return session;
    },
    [adoptSession]
  );

  const signUp = useCallback((profile) => authApi.signUp(profile), []);

  const value = useMemo(
    () => ({ user, isRestoring, signIn, signUp, signOut }),
    [user, isRestoring, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

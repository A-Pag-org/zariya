// Token storage strategy:
//   - Access token lives in memory only (never persisted — XSS cannot read it
//     from storage, and it dies with the tab).
//   - Refresh token + session snapshot live in localStorage so sessions
//     survive reloads and synchronize across tabs via the `storage` event.

const REFRESH_KEY = "zariya.auth.refreshToken";
const SESSION_KEY = "zariya.auth.session";

let accessToken = null;

export const tokenStorage = {
  getAccessToken: () => accessToken,
  setAccessToken: (token) => {
    accessToken = token;
  },

  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),
  setRefreshToken: (token) => localStorage.setItem(REFRESH_KEY, token),

  getSession: () => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
      return null;
    }
  },
  setSession: (session) => localStorage.setItem(SESSION_KEY, JSON.stringify(session)),

  clear: () => {
    accessToken = null;
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(SESSION_KEY);
  },

  sessionStorageKey: SESSION_KEY
};

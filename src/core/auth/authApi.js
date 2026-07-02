import { ROLES } from "../authz/roles";

// Mock authentication backend.
//
// Simulates the real contract the UI will eventually talk to over Axios:
// JWT access tokens (short-lived) + rotating refresh tokens, and a signup
// flow where new accounts stay `pending` until technology@a-pag.org approves
// them. Swap the internals for real endpoints without touching callers.

export const APPROVAL_AUTHORITY = "technology@a-pag.org";
export const DEMO_PASSWORD = "Zariya#2026";

const USERS_KEY = "zariya.auth.directory";
const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const SEED_USERS = [
  {
    id: "usr-ceo",
    name: "Arjun Mehta",
    email: "ceo@a-pag.org",
    password: DEMO_PASSWORD,
    role: ROLES.CEO.id,
    status: "active"
  },
  {
    id: "usr-finance",
    name: "Priya Nair",
    email: "finance@a-pag.org",
    password: DEMO_PASSWORD,
    role: ROLES.FINANCE_OFFICER.id,
    status: "active"
  },
  {
    id: "usr-fundraising",
    name: "Kabir Anand",
    email: "fundraising@a-pag.org",
    password: DEMO_PASSWORD,
    role: ROLES.FUNDRAISING_LEAD.id,
    status: "active"
  }
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadDirectory() {
  try {
    const stored = JSON.parse(localStorage.getItem(USERS_KEY));
    if (Array.isArray(stored) && stored.length > 0) return stored;
  } catch {
    // fall through to seed
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
  return [...SEED_USERS];
}

function saveDirectory(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function encode(payload) {
  return btoa(JSON.stringify(payload)).replace(/=+$/, "");
}

function issueToken(user, ttlMs, type) {
  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode({ sub: user.id, email: user.email, type, exp: Date.now() + ttlMs });
  return `${header}.${body}.mock-signature`;
}

export function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function toPublicUser(user) {
  const publicUser = { ...user };
  delete publicUser.password;
  return publicUser;
}

function issueSession(user) {
  return {
    user: toPublicUser(user),
    accessToken: issueToken(user, ACCESS_TTL_MS, "access"),
    refreshToken: issueToken(user, REFRESH_TTL_MS, "refresh")
  };
}

export const authApi = {
  async signIn({ email, password }) {
    await delay(450);
    const user = loadDirectory().find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user || user.password !== password) {
      throw new Error("Invalid email or password.");
    }
    if (user.status === "pending") {
      throw new Error(
        `Your account is awaiting approval from ${APPROVAL_AUTHORITY}. You will be able to sign in once it is activated.`
      );
    }
    if (user.status !== "active") {
      throw new Error("This account has been deactivated. Contact your administrator.");
    }

    return issueSession(user);
  },

  async signUp(profile) {
    await delay(550);
    const users = loadDirectory();

    if (users.some((user) => user.email.toLowerCase() === profile.email.trim().toLowerCase())) {
      throw new Error("An account with this email already exists.");
    }

    const newUser = {
      id: `usr-${Date.now().toString(36)}`,
      name: `${profile.firstName} ${profile.lastName}`.trim(),
      email: profile.email.trim(),
      password: profile.password,
      role: profile.role,
      status: "pending",
      requestedAt: new Date().toISOString()
    };

    saveDirectory([...users, newUser]);

    return {
      user: toPublicUser(newUser),
      message: `Registration received. ${APPROVAL_AUTHORITY} has been notified and must approve your account before you can sign in.`
    };
  },

  async refresh(refreshToken) {
    await delay(200);
    const payload = decodeToken(refreshToken);

    if (!payload || payload.type !== "refresh" || payload.exp < Date.now()) {
      throw new Error("Session expired. Please sign in again.");
    }

    const user = loadDirectory().find((candidate) => candidate.id === payload.sub);
    if (!user || user.status !== "active") {
      throw new Error("Session is no longer valid.");
    }

    return issueSession(user);
  }
};

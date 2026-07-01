// Dummy authentication service.
// These are placeholder handlers that simulate a network round-trip and always
// succeed. Replace the bodies with real API calls when integrating a backend.

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function signIn(credentials) {
  await delay(600);
  return {
    message: `Signed in as ${credentials.email} (demo).`,
    user: {
      name: credentials.email.split("@")[0] || "Zariya User",
      email: credentials.email
    }
  };
}

export async function signUp(profile) {
  await delay(700);
  return {
    message: `Account created for ${profile.username} (demo).`,
    user: {
      name: `${profile.firstName} ${profile.lastName}`.trim() || profile.username,
      email: profile.email
    }
  };
}

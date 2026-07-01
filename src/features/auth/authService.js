function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function signIn(credentials) {
  await delay(600);
  return {
    message: `Signed in as ${credentials.email}. Connect your API to continue.`
  };
}

export async function signUp(profile) {
  await delay(700);
  return {
    message: `Account created for ${profile.username}. Connect your API to continue.`
  };
}

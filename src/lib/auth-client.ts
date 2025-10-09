import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
});

export const { signIn, signOut, useSession } = authClient;

export const signInGoogle = async () => {
  const data = await signIn.social({
    provider: "google",
  });
  return data;
};

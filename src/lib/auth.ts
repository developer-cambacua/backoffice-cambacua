import { betterAuth } from "better-auth";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  socialProviders: {
    database: {
      type: "postgres",
      url: process.env.SUPABASE_DATABASE_URL!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
});

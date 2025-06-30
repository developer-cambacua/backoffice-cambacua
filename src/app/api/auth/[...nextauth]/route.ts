import { getUserRoleAndCheck } from "@/utils/supabase/authHelpers";
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.rol = await getUserRoleAndCheck(user.email);
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (token && token.rol) {
        session.user.rol = token.rol;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };

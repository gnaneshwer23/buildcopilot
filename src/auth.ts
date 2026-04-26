import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createUser, validateUser } from "@/lib/user-store";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        mode: { label: "Mode", type: "text" },
      },
      authorize: async (credentials) => {
        const { email, password, name, mode } = credentials as Record<string, string>;
        if (!email || !password) return null;

        if (mode === "register") {
          const displayName = name?.trim() || email.split("@")[0];
          const user = await createUser(email, password, displayName);
          if (!user) return null; // email taken
          return user;
        }

        return validateUser(email, password);
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
});

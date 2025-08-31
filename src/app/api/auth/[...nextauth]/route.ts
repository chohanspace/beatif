
import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getUser, saveUser } from "@/lib/auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account.provider === "google") {
        const existingUser = await getUser(user.email);
        if (!existingUser) {
          const newUser = {
            id: user.email,
            email: user.email,
            name: user.name,
            image: user.image,
            createdAt: Date.now(),
            isVerified: true,
            playlists: [],
            defaultPlaylistId: null,
            favoriteSingers: [],
            theme: 'dark',
          };
          // @ts-ignore
          await saveUser(newUser);
        }
      }
      return true
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.email
      }
      return token
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id
        const userFromDb = await getUser(session.user.email);
        if(userFromDb) {
            session.user = { ...session.user, ...userFromDb };
        }
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

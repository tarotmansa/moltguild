import NextAuth from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"

const handler = NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
      authorization: {
        params: {
          scope: "tweet.read users.read offline.access",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add Twitter ID to session
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
})

export { handler as GET, handler as POST }

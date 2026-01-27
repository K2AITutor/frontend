import NextAuth, { type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // TODO: Find existence user in DB
      // const existingUser = await prisma.user.findUnique({
      //   where: { email: user.email },
      // });

      // TODO : If not exist, create new user in DB 
      // if (!existingUser) {
      //   await prisma.user.create({
      //     data: {
      //       email: user.email,
      //       name: user.name,
      //       image: user.image,
      //       role: "STUDENT", // 🔥 role mặc định
      //     },
      //   });
      // }

      return true;
    },

    /**
     * Attach additional information to session object
     */
    async session({ session }) {
      if (!session.user?.email) return session;

      // TODO: Fetch additional user info from DB
      // const dbUser = await prisma.user.findUnique({
      //   where: { email: session.user.email },
      //   select: {
      //     id: true,
      //     role: true,
      //   },
      // });
      const dbUser = {
        id: "sample-user-id",
        role: "PARENT",
      }

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.role = dbUser.role;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

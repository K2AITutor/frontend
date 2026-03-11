import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Initialize NextAuth with shared authOptions
const handler = NextAuth(authOptions);

// App Router requires exporting GET and POST
export { handler as GET, handler as POST };

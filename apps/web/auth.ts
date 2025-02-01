import { prisma } from "@/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthResult } from "next-auth";
import Strava from "next-auth/providers/strava";

const nextAuth = NextAuth({
  providers: [
    Strava({ authorization: { params: { scope: "read,activity:read" } } }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated
      return !!auth
    }
  }
});

export const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
export const auth: NextAuthResult["auth"] = nextAuth.auth;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;
export const handlers: NextAuthResult["handlers"] = nextAuth.handlers;

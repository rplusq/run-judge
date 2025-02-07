import { prisma } from "@/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthResult } from "next-auth";
import Strava from "next-auth/providers/strava";

const nextAuth = NextAuth({
  providers: [
    Strava({
      clientId: process.env.STRAVA_CLIENT_ID!,
      clientSecret: process.env.STRAVA_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read,activity:read_all",
        },
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated
      return !!auth;
    },
    redirect: async ({ url, baseUrl }) => {
      // After successful sign in, redirect to the activity page
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}`;
      }
      return baseUrl;
    },
  },
});

export const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
export const auth: NextAuthResult["auth"] = nextAuth.auth;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;
export const handlers: NextAuthResult["handlers"] = nextAuth.handlers;

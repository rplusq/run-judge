import { prisma } from "@/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthResult } from "next-auth";

const nextAuth = NextAuth({
  providers: [],
  adapter: PrismaAdapter(prisma),
});

export const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
export const auth: NextAuthResult["auth"] = nextAuth.auth;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;
export const handlers: NextAuthResult["handlers"] = nextAuth.handlers;

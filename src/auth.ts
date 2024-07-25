import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { getUserById } from "./data/user";
import db from "./db/db";
import authConfig from "./auth.config";

import { getTwoFactorConfirmationByUserId } from "./data/twoFactorConfirmation";

export type ExtendedUser = DefaultSession["user"] & {
  role: string;
};

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      address: string;
    } & DefaultSession["user"];
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);

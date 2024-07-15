import { JWT } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    role: UserRole;
    idToken?: string;
  }
}

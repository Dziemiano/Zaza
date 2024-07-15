"use server";

import db from "@/db/db";

import * as z from "zod";

import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import {
  generateVerificationToken,
  generateTwoFactorToken,
} from "@/lib/tokens";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail";
import { getTwoFactorTokenByEmail } from "@/data/twoFactorToken";
import { getTwoFactorConfirmationByUserId } from "@/data/twoFactorConfirmation";
import { logEvent } from "./logs";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      error: "Invalid email or password",
    };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return {
      error: "Email does not exist",
    };
  }

  // 2FA verification to enable in future
  // if (!existingUser.emailVerified) {
  //   const verificationToken = await generateVerificationToken(
  //     existingUser.email
  //   );

  //   await sendVerificationEmail(
  //     verificationToken.email,
  //     verificationToken.token
  //   );

  //   return {
  //     success: "Confirmation email sent",
  //   };
  // }

  // if (existingUser.isTwoFactorEnabled && existingUser.email) {
  //   if (code) {
  //     const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

  //     if (!twoFactorToken) {
  //       return {
  //         error: "Invalid code",
  //       };
  //     }

  //     if (twoFactorToken.token !== code) {
  //       return {
  //         error: "Invalid code",
  //       };
  //     }

  //     const hasExpired = new Date() > new Date(twoFactorToken.expires);

  //     if (hasExpired) {
  //       return {
  //         error: "Code has expired",
  //       };
  //     }

  //     await db.twoFactorToken.delete({
  //       where: {
  //         id: twoFactorToken.id,
  //       },
  //     });

  //     const existingConfirmation = await getTwoFactorConfirmationByUserId(
  //       existingUser.id
  //     );

  //     if (existingConfirmation) {
  //       await db.twoFactorConfirmation.delete({
  //         where: {
  //           id: existingConfirmation.id,
  //         },
  //       });
  //     }

  //     await db.twoFactorConfirmation.create({
  //       data: {
  //         userId: existingUser.id,
  //       },
  //     });
  //   } else {
  //     const twoFactorToken = await generateTwoFactorToken(existingUser.email);
  //     await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
  //     return {
  //       twoFactor: true,
  //     };
  //   }
  // }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CallbackRouteError":
          if (
            error.cause &&
            typeof error.cause === "object" &&
            "err" in error.cause
          ) {
            const cause = error.cause as { err: { code?: string } };
            if (cause.err && cause.err.code === "credentials") {
              return { error: "Invalid credentials" };
            }
          }
        default:
          return { error: "An authentication error occurred" };
      }
    }

    throw error;
  }
  return {
    success: "Successfully logged in",
  };
};

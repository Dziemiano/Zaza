"use client";

import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/actions/verification";

import { CardWrapper } from "./cardWrapper";
import { useCallback, useEffect, useState } from "react";
import { FormError } from "./formError";
import { FormSuccess } from "./formSuccess";

export const VerificationForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) {
      return;
    }

    if (!token) {
      setError("Token has expired");
      return;
    }
    verifyEmail(token as string)
      .then(async (data) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setError(data?.error);
        setSuccess(data?.success);
      })
      .catch(() => {
        setError("Something went wrong");
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Verify your email"
      backButtonLabel="Back to login"
      backButtonHref="/login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && <BeatLoader color="black" size={20} />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  );
};

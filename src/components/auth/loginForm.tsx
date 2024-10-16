"use client";

import { CardWrapper } from "./cardWrapper";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { LoginSchema } from "@/schemas";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { FormError } from "./formError";
import { FormSuccess } from "./formSuccess";

import { login } from "@/actions/login";

export const LoginForm = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    startTransition(() => {
      login(values)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
          setOpen(true);
        })
        .finally(() => setIsLoading(false));
    });
  };
  return (
    <CardWrapper
      headerLabel="Login"
      backButtonLabel="Utwórz konto"
      backButtonHref="/register"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex flex-row">
                  <FormLabel className="flex place-content-center pt-6 pr-1 w-32">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@email.com"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-row">
                  <FormLabel className="flex place-content-center pt-6 pr-1 w-32">
                    Hasło
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="*******"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <div className="flex flex-col items-center">
            {/* <PasswordResetForm /> */}
            <Button
              className="mt-4 text-black text-lg w-48  h-10  py-3 bg-white rounded-lg shadow "
              type="submit"
              disabled={isLoading}
            >
              Zaloguj się
            </Button>
          </div>
          {/*

          RESEND feauture to be enabled with new mail service

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Verify login</DialogTitle>
                <DialogDescription>Provide verification code</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem className="flex flex-row">
                          <FormControl>
                            <Input
                              type="code"
                              placeholder="123456"
                              className="w-full"
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormError message={error} />
                  <FormSuccess message={success} />
                  <DialogFooter>
                    <Button type="submit">Submit</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog> */}
        </form>
      </Form>
      <Spinner isLoading={isLoading} />
    </CardWrapper>
  );
};

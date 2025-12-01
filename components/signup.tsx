"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconBrandGithub } from "@tabler/icons-react";
import Password from "./password";
import { Button } from "./button";
import { Logo } from "./Logo";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  email: z
    .string()
    .email("Please enter valid email")
    .min(1, "Please enter email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type SignupUser = z.infer<typeof formSchema>;

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupUser>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignupUser) {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.name,
          },
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess("Check your email to confirm your account");
    } catch (e) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGitHubSignIn() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  }

  return (
    <Form {...form}>
      <div className="flex items-center w-full justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div>
            <div className="flex">
              <Logo />
            </div>
            <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-black dark:text-white">
              Sign up for an account
            </h2>
          </div>

          <div className="mt-10">
            <div>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium leading-6 text-neutral-700 dark:text-muted-dark"
                        >
                          Full name
                        </label>
                        <FormControl>
                          <div className="mt-2">
                            <input
                              id="name"
                              type="name"
                              placeholder="Manu Arora"
                              className="block w-full bg-white dark:bg-neutral-900 px-4 rounded-md border-0 py-1.5  shadow-aceternity text-black placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6 dark:text-white"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium leading-6 text-neutral-700 dark:text-muted-dark"
                        >
                          Email address
                        </label>
                        <FormControl>
                          <div className="mt-2">
                            <input
                              id="email"
                              type="email"
                              placeholder="hello@johndoe.com"
                              className="block w-full bg-white dark:bg-neutral-900 px-4 rounded-md border-0 py-1.5  shadow-aceternity text-black placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6 dark:text-white"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium leading-6 text-neutral-700 dark:text-muted-dark"
                        >
                          Password
                        </label>
                        <FormControl>
                          <div className="mt-2">
                            <Password
                              id="password"
                              type="password"
                              placeholder="••••••••"
                              className="block w-full bg-white dark:bg-neutral-900 px-4 rounded-md border-0 py-1.5  shadow-aceternity text-black placeholder:text-gray-400 focus:ring-2 focus:ring-neutral-400 focus:outline-none sm:text-sm sm:leading-6 dark:text-white"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3">
                    <p className="text-sm text-green-500">{success}</p>
                  </div>
                )}

                <div>
                  <Button className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing up..." : "Sign Up"}
                  </Button>
                  <p
                    className={cn(
                      "text-sm text-neutral-500 text-center mt-4 text-muted dark:text-muted-dark"
                    )}
                  >
                    Already have an account?{" "}
                    <Link href="/login" className="text-black dark:text-white">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            <div className="mt-10">
              <div className="relative">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-neutral-300 dark:border-neutral-700" />
                </div>
                <div className="relative flex justify-center text-sm font-medium leading-6">
                  <span className="bg-white px-6 text-neutral-400 dark:text-neutral-500 dark:bg-black">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 w-full flex items-center justify-center">
                <Button onClick={handleGitHubSignIn} className="w-full py-1.5">
                  <IconBrandGithub className="h-5 w-5" />
                  <span className="text-sm font-semibold leading-6">
                    Github
                  </span>
                </Button>
              </div>

              <p className="text-neutral-600 dark:text-neutral-400 text-sm text-center mt-8">
                By clicking on sign up, you agree to our{" "}
                <Link
                  href="#"
                  className="text-neutral-500 dark:text-neutral-300"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="#"
                  className="text-neutral-500 dark:text-neutral-300"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
}

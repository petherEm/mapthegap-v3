"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // Check if user is immediately confirmed (no email verification required)
        if (data.session) {
          // User is auto-confirmed, redirect to dashboard immediately
          window.location.href = "/dashboard";
        } else {
          // Email verification required, show success message and redirect to login
          setSuccess(true);
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-6">
        <div className="rounded-md bg-green-500/10 border border-green-500/20 p-4">
          <p className="text-sm text-green-400">
            Account created successfully! Check your email to verify your account.
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-6 space-y-4">
        {error && (
          <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-neutral-300"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 block w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-50 placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-neutral-300"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 block w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-50 placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Must be at least 6 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-neutral-300"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-2 block w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-50 placeholder-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-violet-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </div>
    </form>
  );
}

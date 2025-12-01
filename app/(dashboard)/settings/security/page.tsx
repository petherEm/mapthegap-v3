import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function SecurityContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-50">Security</h2>
        <p className="text-sm text-neutral-400">
          Manage your password and security settings
        </p>
      </div>

      {/* Password */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
        <h3 className="font-medium text-neutral-50 mb-1">Password</h3>
        <p className="text-sm text-neutral-400 mb-4">
          Change your password to keep your account secure
        </p>
        <button
          disabled
          className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
        >
          Change Password (Coming Soon)
        </button>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-neutral-50">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-neutral-400">
              Add an extra layer of security to your account
            </p>
          </div>
          <span className="px-3 py-1 bg-neutral-800 text-neutral-400 text-sm rounded-full">
            Disabled
          </span>
        </div>
        <button
          disabled
          className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
        >
          Enable 2FA (Coming Soon)
        </button>
      </div>

      {/* Active Sessions */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
        <h3 className="font-medium text-neutral-50 mb-1">Active Sessions</h3>
        <p className="text-sm text-neutral-400 mb-4">
          Manage your active sessions across devices
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-neutral-200">
                Current Session
              </p>
              <p className="text-xs text-neutral-400">Last active: Just now</p>
            </div>
            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded">
              Active
            </span>
          </div>
        </div>

        <button
          disabled
          className="mt-4 px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
        >
          Sign Out All Devices (Coming Soon)
        </button>
      </div>
    </div>
  );
}

function SecurityLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-24 bg-neutral-800 rounded animate-pulse" />
        <div className="h-5 w-56 bg-neutral-800 rounded animate-pulse mt-2" />
      </div>
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
        <div className="h-24 bg-neutral-800 rounded animate-pulse" />
      </div>
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
        <div className="h-24 bg-neutral-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <Suspense fallback={<SecurityLoading />}>
      <SecurityContent />
    </Suspense>
  );
}

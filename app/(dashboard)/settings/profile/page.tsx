import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function ProfileContent() {
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
        <h2 className="text-lg font-semibold text-neutral-50">Profile</h2>
        <p className="text-sm text-neutral-400">
          Manage your account information
        </p>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Email Address
          </label>
          <p className="text-neutral-50">{user.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            User ID
          </label>
          <p className="text-neutral-50 font-mono text-xs bg-neutral-800 px-3 py-2 rounded">
            {user.id}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-1">
            Account Created
          </label>
          <p className="text-neutral-50">
            {user.created_at
              ? new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Unknown"}
          </p>
        </div>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
        <h3 className="font-medium text-neutral-50 mb-3">Update Profile</h3>
        <p className="text-sm text-neutral-400 mb-4">
          Profile updates coming soon. You&apos;ll be able to update your name,
          avatar, and other details.
        </p>
        <button
          disabled
          className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
        >
          Edit Profile (Coming Soon)
        </button>
      </div>
    </div>
  );
}

function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-24 bg-neutral-800 rounded animate-pulse" />
        <div className="h-5 w-48 bg-neutral-800 rounded animate-pulse mt-2" />
      </div>
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="h-16 bg-neutral-800 rounded animate-pulse" />
        <div className="h-16 bg-neutral-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  );
}

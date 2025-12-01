import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Suspense } from "react";

async function DangerContent() {
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
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">Danger Zone</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Irreversible actions for your account
        </p>
      </div>

      {/* Export Data */}
      <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
        <h3 className="font-medium text-neutral-900 dark:text-neutral-50 mb-1">Export Your Data</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          Download all your data including locations, settings, and account
          information
        </p>
        <button
          disabled
          className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
        >
          Export All Data (Coming Soon)
        </button>
      </div>

      {/* Delete Account */}
      <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-50 mb-1">Delete Account</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-red-600 dark:text-red-400">This will immediately:</p>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 list-disc list-inside">
                <li>Delete all your imported location data</li>
                <li>Cancel any active subscriptions</li>
                <li>Remove all your account settings</li>
                <li>Permanently delete your account</li>
              </ul>
            </div>
            <button
              disabled
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium opacity-50 cursor-not-allowed hover:bg-red-700 transition-colors"
            >
              Delete Account (Coming Soon)
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Need help? Contact us at{" "}
          <a
            href="mailto:support@example.com"
            className="text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300"
          >
            support@example.com
          </a>{" "}
          before making any irreversible changes.
        </p>
      </div>
    </div>
  );
}

function DangerLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        <div className="h-5 w-48 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mt-2" />
      </div>
      <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
        <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
      </div>
      <div className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl p-5">
        <div className="h-40 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function DangerPage() {
  return (
    <Suspense fallback={<DangerLoading />}>
      <DangerContent />
    </Suspense>
  );
}

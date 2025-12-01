import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/auth/roles";
import { ImportPageClient } from "@/components/dashboard/ImportPageClient";
import { Suspense } from "react";

// Loading fallback component
function ImportLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="h-4 w-96 bg-muted/50 rounded" />
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  );
}

// Auth check component (wrapped in Suspense)
async function ImportContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  // Redirect to dashboard if not superadmin
  if (!isSuperAdmin(user)) {
    redirect("/dashboard");
  }

  return <ImportPageClient />;
}

export default function ImportPage() {
  return (
    <Suspense fallback={<ImportLoading />}>
      <ImportContent />
    </Suspense>
  );
}

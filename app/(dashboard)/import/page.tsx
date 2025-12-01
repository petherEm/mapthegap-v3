import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/auth/roles";
import { ImportPageClient } from "@/components/dashboard/ImportPageClient";

export default async function ImportPage() {
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

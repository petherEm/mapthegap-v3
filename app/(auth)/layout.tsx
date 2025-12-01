import { AuthLayout } from "@/layouts/auth-layout";
import { NavBar } from "@/components/navbar";

export default function AuthXLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      <AuthLayout>
        <main className="flex h-full min-h-screen w-full bg-white dark:bg-black pt-20">{children}</main>
      </AuthLayout>
    </>
  );
}

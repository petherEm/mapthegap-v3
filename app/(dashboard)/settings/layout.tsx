"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, CreditCard, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsNav = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: User,
    description: "Manage your account details",
  },
  {
    title: "Billing",
    href: "/settings/billing",
    icon: CreditCard,
    description: "Manage your subscription and payments",
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: Shield,
    description: "Password and security settings",
  },
  {
    title: "Danger Zone",
    href: "/settings/danger",
    icon: AlertTriangle,
    description: "Delete account and export data",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-50">Settings</h1>
          <p className="mt-1 text-neutral-400">
            Manage your account and preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <nav className="lg:w-64 flex-shrink-0">
            <ul className="space-y-1">
              {settingsNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-violet-500/10 text-violet-400"
                          : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content Area */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

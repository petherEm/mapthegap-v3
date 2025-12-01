"use client";

import { AuthProvider } from "@/context/AuthProvider";

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="h-screen w-screen overflow-hidden bg-background">
        {children}
      </div>
    </AuthProvider>
  );
}

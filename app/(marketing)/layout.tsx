import type { Metadata } from "next";
import "../globals.css";
import { NavBar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "MapTheGap",
  description:
    "MapTheGap helps businesses discover network coverage gaps and optimize their location strategies. Visualize and analyze location networks across multiple countries with powerful mapping and analytics tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="bg-white dark:bg-black text-neutral-900 dark:text-neutral-50 min-h-screen">
      <NavBar />
      {children}
      <Footer />
    </main>
  );
}

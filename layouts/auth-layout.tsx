"use client";
import { cn } from "@/lib/utils";
import { HorizontalGradient } from "@/components/horizontal-gradient";
import { Logo } from "@/components/Logo";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

const creator = [
  {
    id: 1,
    name: "Hi there, happy to see you!",
    designation: "Please shoot me any improvement suggestions",
    image: "/piotr_bw_2025.jpeg",
  },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2">
        {children}
        <div className="relative w-full z-20 hidden md:flex border-l border-neutral-100 dark:border-neutral-800 overflow-hidden bg-gray-50 dark:bg-neutral-900 items-center justify-center">
          <div className="max-w-sm mx-auto flex flex-col items-center">
            {/* Logo */}
            <div className="mb-6">
              <Logo size="lg" href="#" />
            </div>

            {/* Description */}
            <p
              className={cn(
                "font-normal text-base text-center text-neutral-500 dark:text-neutral-400 leading-relaxed"
              )}
            >
              Built with passion for code and remittance. Location Intelligence,
              in-depth analytics, AI-powered insights and continuous development.
            </p>
          </div>

          {/* Creator Photo - bottom right with tooltip going up-left */}
          <div className="absolute bottom-8 right-8">
            <AnimatedTooltip items={creator} position="top-left" />
          </div>

          <HorizontalGradient className="top-20" />
          <HorizontalGradient className="bottom-20" />
          <HorizontalGradient className="-right-80 transform rotate-90 inset-y-0 h-full scale-x-150" />
          <HorizontalGradient className="-left-80 transform rotate-90 inset-y-0 h-full scale-x-150" />
        </div>
      </div>
    </>
  );
}

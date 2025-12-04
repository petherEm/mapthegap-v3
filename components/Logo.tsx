"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  href?: string;
}

export const Logo = ({ size = "md", className = "", href = "/" }: LogoProps) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Logo aspect ratio is ~3.3:1 (images are 1004x302 and 1008x298)
  const sizeMap = {
    sm: { width: 120, height: 36 },
    md: { width: 160, height: 48 },
    lg: { width: 200, height: 60 },
    xl: { width: 250, height: 76 },
  };

  const { width, height } = sizeMap[size];

  // mtg_dark.png is FOR dark backgrounds, mtg_light.png is FOR light backgrounds
  const logoSrc = mounted && resolvedTheme === "dark"
    ? "/mtg_dark.png"
    : "/mtg_light.png";

  return (
    <Link
      href={href}
      className={`flex items-center relative z-20 ${className}`}
    >
      <Image
        src={logoSrc}
        alt="MapTheGap"
        width={width}
        height={height}
        className="flex-shrink-0 object-contain"
        priority
      />
    </Link>
  );
};

// Standalone logo image component (no link)
export const LogoImage = ({ size = "md", className = "" }: Omit<LogoProps, "href">) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Logo aspect ratio is ~3.3:1 (images are 1004x302 and 1008x298)
  const sizeMap = {
    sm: { width: 120, height: 36 },
    md: { width: 160, height: 48 },
    lg: { width: 200, height: 60 },
    xl: { width: 250, height: 76 },
  };

  const { width, height } = sizeMap[size];

  // mtg_dark.png is FOR dark backgrounds, mtg_light.png is FOR light backgrounds
  const logoSrc = mounted && resolvedTheme === "dark"
    ? "/mtg_dark.png"
    : "/mtg_light.png";

  return (
    <Image
      src={logoSrc}
      alt="MapTheGap"
      width={width}
      height={height}
      className={`flex-shrink-0 object-contain ${className}`}
      priority
    />
  );
};

// Short/icon logo for collapsed sidebar
export const LogoIcon = ({ size = 32, className = "" }: { size?: number; className?: string }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // mtg_dark_short.png is FOR dark backgrounds, mtg_light_short.png is FOR light backgrounds
  const logoSrc = mounted && resolvedTheme === "dark"
    ? "/mtg_dark_short.png"
    : "/mtg_light_short.png";

  return (
    <Image
      src={logoSrc}
      alt="MapTheGap"
      width={size}
      height={size}
      className={`flex-shrink-0 object-contain ${className}`}
      priority
    />
  );
};

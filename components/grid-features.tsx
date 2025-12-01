import { cn } from "@/lib/utils";
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  FingerPrintIcon,
  LockClosedIcon,
  ServerIcon,
  MapIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export const GridFeatures = () => {
  const features = [
    {
      title: "Real-time data sync",
      description:
        "Continuously updated location data scraped from retail networks, ensuring you always work with the latest market intelligence.",
      icon: <CloudArrowUpIcon className="h-6 w-6" />,
    },
    {
      title: "Secure data handling",
      description:
        "Enterprise-grade security and encryption protect your competitive analysis and proprietary market insights.",
      icon: <LockClosedIcon className="h-6 w-6" />,
    },
    {
      title: "Instant filtering",
      description:
        "Filter thousands of locations by network, city, ZIP code, or county in milliseconds with optimized client-side processing.",
      icon: <ArrowPathIcon className="h-6 w-6" />,
    },
    {
      title: "Network identification",
      description:
        "Automatically detect and categorize retail networks and subnetworks with smart pattern recognition algorithms.",
      icon: <FingerPrintIcon className="h-6 w-6" />,
    },
    {
      title: "Flexible export",
      description:
        "Export filtered datasets and visualizations in multiple formats for presentations, reports, and further analysis.",
      icon: <Cog6ToothIcon className="h-6 w-6" />,
    },
    {
      title: "Historical tracking",
      description:
        "Track market changes over time with comprehensive data versioning and historical snapshots of retail landscapes.",
      icon: <ServerIcon className="h-6 w-6" />,
    },
    {
      title: "Multi-country coverage",
      description:
        "Access retail network data across 8+ European countries with unified visualization and consistent data formats.",
      icon: <GlobeAltIcon className="h-6 w-6" />,
    },
    {
      title: "Interactive mapping",
      description:
        "Switch between clustered and individual views, zoom into specific regions, and explore market dynamics in real-time.",
      icon: <MapIcon className="h-6 w-6" />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
};

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover:opacity-100 transition duration-200 group absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover:opacity-100 transition duration-200 group absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-500 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover:bg-violet-500 transition duration-200" />
        <span className="group-hover:translate-x-2 transition duration-200 inline-block">
          {title}
        </span>
      </div>
      <p className="text-sm text-muted dark:text-muted-dark max-w-xs mx-auto relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};

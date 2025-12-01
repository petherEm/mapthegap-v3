"use client";

type MapClusterMarkerProps = {
  pointCount: number;
  onClick: () => void;
  color?: string; // Network color (e.g., "#ef4444" for Ria)
};

// Helper function to determine if a color is light or dark
function isLightColor(hexColor: string): boolean {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return true if color is light (luminance > 0.5)
  return luminance > 0.5;
}

export function MapClusterMarker({
  pointCount,
  onClick,
  color = "#ef4444", // Default to violet-500 if not provided
}: MapClusterMarkerProps) {
  // Calculate size based on point count
  const size = 40 + Math.min(pointCount / 10, 20);

  // Determine text color based on background brightness
  const textColor = isLightColor(color) ? "#000000" : "#ffffff";

  return (
    <button
      onClick={onClick}
      className="relative cursor-pointer transform transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-950 rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      aria-label={`Cluster of ${pointCount} locations`}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full opacity-20 animate-pulse"
        style={{
          backgroundColor: color,
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />

      {/* Middle ring */}
      <div
        className="absolute inset-0 rounded-full opacity-40 scale-90"
        style={{ backgroundColor: color }}
      />

      {/* Inner circle */}
      <div
        className="absolute inset-0 rounded-full scale-75 flex items-center justify-center shadow-lg"
        style={{ backgroundColor: color }}
      >
        <span
          className="font-semibold text-sm"
          style={{ color: textColor }}
        >
          {pointCount >= 1000
            ? `${Math.floor(pointCount / 1000)}k`
            : pointCount}
        </span>
      </div>
    </button>
  );
}

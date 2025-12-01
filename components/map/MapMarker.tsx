"use client";

type MapMarkerProps = {
  color: string;
  onClick: () => void;
};

export function MapMarker({ color, onClick }: MapMarkerProps) {
  return (
    <button
      onClick={onClick}
      className="relative cursor-pointer transform transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-neutral-950 rounded-full"
      aria-label="View location details"
    >
      {/* Pin Shape */}
      <svg
        width="32"
        height="40"
        viewBox="0 0 32 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Pin body */}
        <path
          d="M16 0C7.163 0 0 7.163 0 16C0 24.837 16 40 16 40C16 40 32 24.837 32 16C32 7.163 24.837 0 16 0Z"
          fill={color}
          opacity="0.9"
        />
        {/* Inner circle */}
        <circle cx="16" cy="16" r="6" fill="white" opacity="0.9" />
        {/* Center dot */}
        <circle cx="16" cy="16" r="3" fill={color} />
      </svg>

      {/* Pulse animation on hover */}
      <span
        className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-30 animate-ping"
        style={{ backgroundColor: color }}
      />
    </button>
  );
}

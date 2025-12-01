"use client";

type ViewMode = "clustered" | "individual";

type ViewModeToggleProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ViewModeToggleProps) {
  return (
    <div className="rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4">
      <h3 className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-3">
        Map Display
      </h3>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="viewMode"
            value="clustered"
            checked={viewMode === "clustered"}
            onChange={() => onViewModeChange("clustered")}
            className="w-4 h-4 text-violet-500 border-neutral-300 dark:border-neutral-700 focus:ring-violet-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors">
            Clustered (Faster)
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name="viewMode"
            value="individual"
            checked={viewMode === "individual"}
            onChange={() => onViewModeChange("individual")}
            className="w-4 h-4 text-violet-500 border-neutral-300 dark:border-neutral-700 focus:ring-violet-500 focus:ring-offset-white dark:focus:ring-offset-neutral-900"
          />
          <span className="text-sm text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-neutral-50 transition-colors">
            Individual Markers
          </span>
        </label>
      </div>
      {viewMode === "individual" && (
        <p className="mt-3 text-xs text-neutral-500">
          Shows all locations as tiny dots to spot coverage gaps
        </p>
      )}
    </div>
  );
}

export function CountryListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="border border-border rounded-lg bg-card/30 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-muted rounded animate-pulse" />
            <div className="w-8 h-8 bg-muted rounded animate-pulse" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-24 bg-muted/50 rounded animate-pulse mt-1" />
            </div>
            <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

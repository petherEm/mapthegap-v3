export default function MapsLoading() {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-5 w-96 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-card/50 border border-border rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-muted rounded animate-pulse" />
                <div>
                  <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-24 bg-muted rounded animate-pulse mt-1" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-full bg-muted rounded animate-pulse" />
                <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-8 w-1/2 bg-muted rounded animate-pulse" />
              </div>
              <div className="mt-4 h-10 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

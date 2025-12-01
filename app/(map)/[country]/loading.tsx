export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center space-y-6">
        {/* Animated spinner */}
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-border"></div>
          <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin"></div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">
            Loading map data...
          </p>
          <p className="text-sm text-muted-foreground">
            Preparing locations and networks
          </p>
        </div>

        {/* Optional: Progress dots animation */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}

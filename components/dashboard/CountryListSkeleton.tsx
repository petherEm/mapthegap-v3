/**
 * Skeleton loader for the country accordion list.
 * Matches the structure of CountryAccordion for seamless loading transition.
 */
export function CountryListSkeleton() {
  return (
    <div className="space-y-2">
      {/* Stats header skeleton */}
      <div className="mb-6">
        <div className="h-5 w-80 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
      </div>

      {/* Country accordion skeletons */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-neutral-50 dark:bg-neutral-900/30"
        >
          {/* Accordion Header */}
          <div className="w-full flex items-center gap-3 px-4 py-3">
            {/* Chevron */}
            <div
              className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            />

            {/* Flag placeholder */}
            <div
              className="w-7 h-7 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse flex-shrink-0"
              style={{ animationDelay: `${i * 50 + 25}ms` }}
            />

            {/* Country name and stats */}
            <div className="flex-1 min-w-0">
              <div
                className="h-5 w-28 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-1.5"
                style={{ animationDelay: `${i * 50 + 50}ms` }}
              />
              <div
                className="h-4 w-20 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"
                style={{ animationDelay: `${i * 50 + 75}ms` }}
              />
            </div>

            {/* Network count badge */}
            <div
              className="h-4 w-16 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse flex-shrink-0"
              style={{ animationDelay: `${i * 50 + 100}ms` }}
            />
          </div>

          {/* First item shows expanded content skeleton */}
          {i === 1 && (
            <div className="px-4 pb-4 pt-1 border-t border-neutral-200 dark:border-neutral-800/50">
              {/* Industry sections */}
              {[1, 2].map((ind) => (
                <div key={ind} className="mb-3 last:mb-0">
                  {/* Industry header */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <div
                      className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"
                      style={{ animationDelay: `${ind * 75}ms` }}
                    />
                    <div
                      className="h-3 w-24 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse"
                      style={{ animationDelay: `${ind * 75 + 25}ms` }}
                    />
                  </div>

                  {/* Network tags skeleton - horizontal flow */}
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3, 4].slice(0, ind === 1 ? 4 : 3).map((tag) => (
                      <div
                        key={tag}
                        className="h-8 rounded-md bg-neutral-200 dark:bg-neutral-700 animate-pulse"
                        style={{
                          width: `${70 + (tag * 20)}px`,
                          animationDelay: `${(ind * 75) + (tag * 40)}ms`
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

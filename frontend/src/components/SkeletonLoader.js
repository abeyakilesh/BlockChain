'use client';

export function CardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100 dark:bg-gray-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
        <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-pulse w-full">
      <div className="space-y-6">
        <div className="aspect-square sm:aspect-video lg:aspect-square rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="card p-6 h-48" />
      </div>
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3 mb-8" />
        <div className="space-y-2 mb-8">
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-4/6" />
        </div>
        <div className="card p-6 mb-8 h-40" />
        <div className="card p-6 h-32" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse w-full animate-fade-in">
      <div className="flex justify-between mb-8">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2" />
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-96" />
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-36" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card h-28" />
        ))}
      </div>
      <div className="h-[280px] card mb-8" />
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-sm mb-6" />
      <div className="h-[300px] card" />
    </div>
  );
}

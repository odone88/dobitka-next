import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24 ml-auto" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Title */}
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-60" />

        {/* Filter bar */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded" />
          <Skeleton className="h-9 w-24 rounded" />
          <Skeleton className="h-9 w-24 rounded" />
        </div>

        {/* Table skeleton */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20 ml-auto" />
            <Skeleton className="h-3 w-16" />
          </div>

          {/* Table rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0">
              <Skeleton className="h-4 w-12" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-36" />
              </div>
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

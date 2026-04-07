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
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-64" />

        {/* 4 match card skeletons */}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10 ml-auto" />
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-7 w-14 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-3 w-32 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

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
        {/* Page title */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>

        {/* Table header */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-6 ml-auto" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-8" />
          </div>

          {/* Table rows */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-b-0">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-6 ml-auto" />
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

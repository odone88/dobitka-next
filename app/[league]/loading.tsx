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
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* League header */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>

        {/* Two card placeholders */}
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        ))}

        {/* Table placeholder */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <Skeleton className="h-5 w-20" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-8 ml-auto" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

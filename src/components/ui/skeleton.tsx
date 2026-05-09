import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}

// Pre-built skeleton components for common patterns
function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-8 w-2/3 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-card">
      <Skeleton className="h-4 w-1/4 mb-4" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}

function SkeletonQuote() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="text-right">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonChart, SkeletonQuote };

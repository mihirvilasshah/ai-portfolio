import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

/**
 * Stat card for displaying key metrics
 */
export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <div className="text-muted-foreground">{icon}</div>
          )}
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{value}</p>
          {(description || trend) && (
            <div className="mt-1 flex items-center gap-2">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center text-xs font-medium",
                    trend.isPositive
                      ? "text-success-600 dark:text-success-500"
                      : "text-danger-600 dark:text-danger-500"
                  )}
                >
                  {trend.isPositive ? (
                    <svg className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {Math.abs(trend.value)}%
                </span>
              )}
              {description && (
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

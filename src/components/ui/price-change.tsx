import { cn } from "@/lib/utils";
import { formatPercent, formatCurrency } from "@/lib/utils";

interface PriceChangeProps {
  change: number;
  changePercent: number;
  currency?: "INR" | "USD";
  showCurrency?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Price change display with color coding
 */
export function PriceChange({
  change,
  changePercent,
  currency = "INR",
  showCurrency = true,
  size = "md",
  className,
}: PriceChangeProps) {
  const isPositive = change >= 0;
  
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1",
        isPositive ? "text-success-600 dark:text-success-500" : "text-danger-600 dark:text-danger-500",
        sizeClasses[size],
        className
      )}
    >
      {isPositive ? (
        <svg
          className={iconSizes[size]}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          className={iconSizes[size]}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      <span className="font-medium">
        {showCurrency
          ? formatCurrency(Math.abs(change), currency, {
              signDisplay: "never",
            })
          : Math.abs(change).toFixed(2)}
      </span>
      <span className="text-muted-foreground">
        ({formatPercent(changePercent)})
      </span>
    </div>
  );
}

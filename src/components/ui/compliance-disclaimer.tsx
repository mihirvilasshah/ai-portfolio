import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface ComplianceDisclaimerProps {
  variant?: "inline" | "block" | "footer";
  className?: string;
}

/**
 * Compliance disclaimer component
 * Must be displayed on all recommendation surfaces
 */
export function ComplianceDisclaimer({
  variant = "block",
  className,
}: ComplianceDisclaimerProps) {
  if (variant === "inline") {
    return (
      <span
        className={cn(
          "text-xs text-muted-foreground italic",
          className
        )}
      >
        Educational purposes only. Not financial advice.
      </span>
    );
  }

  if (variant === "footer") {
    return (
      <div
        className={cn(
          "border-t bg-muted/30 py-4 px-6 text-center text-xs text-muted-foreground",
          className
        )}
      >
        <p>{siteConfig.disclaimer}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg bg-muted/50 border border-muted p-4 text-sm text-muted-foreground",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 text-warning-500 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div>
          <p className="font-medium text-foreground mb-1">Disclaimer</p>
          <p>{siteConfig.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}

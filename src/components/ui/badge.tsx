import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // Stock/Investment specific variants
        success:
          "border-transparent bg-success-50 text-success-700 dark:bg-success-500/20 dark:text-success-500",
        danger:
          "border-transparent bg-danger-50 text-danger-700 dark:bg-danger-500/20 dark:text-danger-500",
        warning:
          "border-transparent bg-warning-50 text-warning-600 dark:bg-warning-500/20 dark:text-warning-500",
        // Recommendation badges
        buy:
          "border-transparent bg-success-600 text-white",
        strongBuy:
          "border-transparent bg-success-700 text-white",
        hold:
          "border-transparent bg-yellow-500 text-white",
        sell:
          "border-transparent bg-danger-600 text-white",
        strongSell:
          "border-transparent bg-danger-700 text-white",
        // Risk badges
        lowRisk:
          "border-transparent bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-500",
        mediumRisk:
          "border-transparent bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500",
        highRisk:
          "border-transparent bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-500",
        veryHighRisk:
          "border-transparent bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-500",
        // Valuation badges
        undervalued:
          "border-transparent bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-500",
        fairlyValued:
          "border-transparent bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-500",
        overvalued:
          "border-transparent bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

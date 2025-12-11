import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        // Neon variants
        neon: "border-primary/50 bg-primary/20 text-primary shadow-[0_0_10px_hsl(185_100%_50%/0.3)]",
        "neon-magenta": "border-secondary/50 bg-secondary/20 text-secondary shadow-[0_0_10px_hsl(320_100%_50%/0.3)]",
        "neon-purple": "border-accent/50 bg-accent/20 text-accent shadow-[0_0_10px_hsl(270_100%_60%/0.3)]",
        "neon-green": "border-neon-green/50 bg-neon-green/20 text-neon-green shadow-[0_0_10px_hsl(150_100%_50%/0.3)]",
        "neon-orange": "border-neon-orange/50 bg-neon-orange/20 text-neon-orange shadow-[0_0_10px_hsl(30_100%_55%/0.3)]",
        pro: "border-transparent bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg",
        free: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border-border shadow-sm",
        neon: "bg-card/80 backdrop-blur-md border-primary/30 shadow-[0_0_30px_hsl(185_100%_50%/0.1)] hover:shadow-[0_0_40px_hsl(185_100%_50%/0.2)] hover:border-primary/50",
        "neon-magenta": "bg-card/80 backdrop-blur-md border-secondary/30 shadow-[0_0_30px_hsl(320_100%_50%/0.1)] hover:shadow-[0_0_40px_hsl(320_100%_50%/0.2)] hover:border-secondary/50",
        "neon-purple": "bg-card/80 backdrop-blur-md border-accent/30 shadow-[0_0_30px_hsl(270_100%_60%/0.1)] hover:shadow-[0_0_40px_hsl(270_100%_60%/0.2)] hover:border-accent/50",
        glass: "bg-card/50 backdrop-blur-xl border-border/50",
        gradient: "bg-gradient-to-br from-card via-card to-muted border-border/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };

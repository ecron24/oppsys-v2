"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@oppsys/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

export const tootltipVariants = cva("", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground fill-primary",
      "default-outline": "bg-primary text-primary-foreground fill-primary",
      destructive:
        "bg-destructive text-white fill-destructive dark:bg-destructive/60",
      "destructive-outline":
        "bg-destructive text-white fill-destructive dark:bg-destructive/60",
      "destructive-soft":
        "bg-destructive/20 fill-destructive/20 text-destructive",
      outline:
        "border bg-background fill-background dark:bg-input/30 dark:border-input",
      secondary: "bg-secondary text-secondary-foreground fill-secondary",
      muted: "bg-muted text-muted-foreground fill-muted",
      ghost: "bg-primary text-accent-foreground fill-primary",
      link: "bg-primary text-accent-foreground fill-primary",
      success:
        "text-white bg-green-500 hover:bg-green-600 fill-green-500 dark:bg-green-600 dark:hover:bg-green-500",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  variant,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> &
  VariantProps<typeof tootltipVariants>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-foreground text-background animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          tootltipVariants({ variant }),
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          className={cn(
            "bg-foreground fill-foreground z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
            tootltipVariants({ variant })
          )}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

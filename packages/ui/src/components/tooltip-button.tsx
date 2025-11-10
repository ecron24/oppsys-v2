import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  tootltipVariants,
} from "./tooltip";
import React, { type ComponentProps } from "react";
import { Button } from "./button";
import { type VariantProps } from "class-variance-authority";

export function TooltipButton({
  tooltip,
  variant,
  tooltipVariant,
  ...props
}: TooltipButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={variant} {...props} />
      </TooltipTrigger>
      <TooltipContent variant={tooltipVariant || variant}>
        <div>{tooltip}</div>
      </TooltipContent>
    </Tooltip>
  );
}

type TooltipButtonProps = ComponentProps<typeof Button> & {
  tooltip: React.ReactNode;
  variant?: VariantProps<typeof tootltipVariants>["variant"];
  tooltipVariant?: VariantProps<typeof tootltipVariants>["variant"];
};

import { type ComponentProps } from "react";
import { cn } from "../lib/utils";

export function H1({ className, ...props }: TypographyProps) {
  return (
    <h1
      className={cn(
        "text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-balance scroll-m-20 ",
        className
      )}
      {...props}
    ></h1>
  );
}

export function H2({ className, ...props }: TypographyProps) {
  return (
    <h2
      className={cn(
        "text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight scroll-m-20 tracking-tight",
        className
      )}
      {...props}
    ></h2>
  );
}

export function H3({ className, ...props }: TypographyProps) {
  return (
    <h3
      className={cn(
        "text-xl sm:text-2xl font-semibold mb-3 leading-tight scroll-m-20 tracking-tight",
        className
      )}
      {...props}
    ></h3>
  );
}

export function H4({ className, ...props }: TypographyProps) {
  return (
    <h4
      className={cn(
        "text-lg sm:text-xl font-semibold mb-2 scroll-m-20 tracking-tight",
        className
      )}
      {...props}
    ></h4>
  );
}

export function P({ className, ...props }: TypographyProps) {
  return (
    <p
      className={cn("leading-7 text-muted-foreground mb-4", className)}
      {...props}
    ></p>
  );
}

type TypographyProps = ComponentProps<"h1">;

import { Button } from "@oppsys/ui";
import { type ComponentProps } from "react";
import { Link } from "react-router";

export function LinkButton({ to, children, ...props }: LinkButtonProps) {
  return (
    <Button {...props} asChild>
      <Link to={to}>{children}</Link>
    </Button>
  );
}

type LinkButtonProps = ComponentProps<typeof Button> &
  ComponentProps<typeof Link>;

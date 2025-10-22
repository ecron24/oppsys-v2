import { type ComponentProps } from "react";
import { Button } from "../button";
import { useFormContext } from "./form-setup";
import { Loader2Icon } from "lucide-react";

export function SubmitButton({
  children,
  className,
  isLoading,
  ...buttonProps
}: SubmitButtonProps) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(s) => s.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type="submit"
          className={className}
          {...buttonProps}
          disabled={isSubmitting || isLoading}
        >
          {(isSubmitting || isLoading) && (
            <Loader2Icon className="animate-spin" />
          )}
          {children}
        </Button>
      )}
    </form.Subscribe>
  );
}

type SubmitButtonProps = ComponentProps<typeof Button> & {
  isLoading?: boolean;
};

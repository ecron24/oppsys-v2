import * as React from "react";
import { useFieldContext } from "./form-setup";
import { Field, FieldDescription, FieldError, FieldLabel } from "../field";
import { cn } from "@oppsys/ui/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "../input-group";
import type { Textarea } from "../textarea";

type TextareaFieldProps = {
  label: React.ReactNode;
  className?: string;
  textareaClassName?: string;
  description?: string;
  required?: boolean;
  iconLeft?: React.ReactNode;
} & Omit<
  React.ComponentProps<typeof Textarea>,
  "value" | "defaultValue" | "onChange"
>;

export function TextareaField({
  label,
  className,
  textareaClassName,
  required,
  description,
  iconLeft,
  ...inputProps
}: TextareaFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid} className={cn(className)}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupTextarea
          {...inputProps}
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          className={cn(textareaClassName)}
        />
        {iconLeft && <InputGroupAddon>{iconLeft}</InputGroupAddon>}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

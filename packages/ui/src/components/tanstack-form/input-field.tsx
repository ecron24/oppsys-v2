import * as React from "react";
import { Input } from "../input";
import { useFieldContext } from "./form-setup";
import { Field, FieldDescription, FieldError, FieldLabel } from "../field";
import { cn } from "@oppsys/ui/lib/utils";

type InputFieldProps = {
  label: React.ReactNode;
  className?: string;
  description?: string;
  required?: boolean;
} & Omit<
  React.ComponentProps<typeof Input>,
  "value" | "defaultValue" | "onChange"
>;

export function InputField({
  label,
  className,
  required,
  description,
  ...inputProps
}: InputFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid} className={cn(className)}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        {...inputProps}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

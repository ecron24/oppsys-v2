import * as React from "react";
import { Input } from "../input";
import { useFieldContext } from "./form-setup";
import { Field, FieldDescription, FieldError, FieldLabel } from "../field";
import { cn } from "@oppsys/ui/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../input-group";
import { Eye, EyeOff } from "lucide-react";

export function InputPasswordField({
  label,
  className,
  required,
  description,
  iconLeft,
  ...inputProps
}: InputPasswordFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Field data-invalid={isInvalid} className={cn(className)}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          {...inputProps}
          type={showPassword ? "text" : "password"}
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
        />
        {iconLeft && <InputGroupAddon>{iconLeft}</InputGroupAddon>}
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            title={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
            size="icon-xs"
            onClick={() => {
              setShowPassword(!showPassword);
            }}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

type InputPasswordFieldProps = {
  label: React.ReactNode;
  className?: string;
  description?: string;
  required?: boolean;
  iconLeft?: React.ReactNode;
} & Omit<
  React.ComponentProps<typeof Input>,
  "value" | "defaultValue" | "onChange" | "type"
>;

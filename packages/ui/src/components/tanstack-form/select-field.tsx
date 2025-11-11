import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../select";
import { Field, FieldDescription, FieldError, FieldLabel } from "../field";
import { cn } from "@oppsys/ui/lib/utils";
import { useFieldContext } from "./form-setup";

type SelectFieldProps = {
  label: React.ReactNode;
  className?: string;
  description?: string;
  required?: boolean;
  options: { label: React.ReactNode; value: string }[];
  placeholder?: string;
} & Omit<
  React.ComponentProps<typeof Select>,
  "value" | "defaultValue" | "onValueChange"
>;

export function SelectField({
  label,
  className,
  required,
  description,
  options,
  placeholder,
  ...selectProps
}: SelectFieldProps) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field data-invalid={isInvalid} className={cn(className)}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Select
        {...selectProps}
        value={field.state.value}
        onValueChange={field.handleChange}
        name={field.name}
      >
        <SelectTrigger aria-invalid={isInvalid} id={field.name}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { InputField } from "./input-field";
import { SubmitButton } from "./submit-button";
import { InputPasswordField } from "./input-password-field";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    InputField,
    InputPasswordField,
  },
  formComponents: {
    SubmitButton,
  },
});

export { useFieldContext, useAppForm, useFormContext };

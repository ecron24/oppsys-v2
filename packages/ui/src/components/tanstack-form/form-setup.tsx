import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { InputField } from "./input-field";
import { SubmitButton } from "./submit-button";

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    InputField,
  },
  formComponents: {
    SubmitButton,
  },
});

export { useFieldContext, useAppForm, useFormContext };

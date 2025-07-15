import { useState, useCallback } from "react";

interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

interface UseFormStateOptions<T> {
  initialData: T;
  validationSchema?: (data: T) => Partial<Record<keyof T, string>>;
  onSubmit?: (data: T) => Promise<void> | void;
}

export const useFormState = <T extends Record<string, any>>({
  initialData,
  validationSchema,
  onSubmit,
}: UseFormStateOptions<T>) => {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
    isDirty: false,
  });

  const updateField = useCallback((field: keyof T, value: any) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
      errors: { ...prev.errors, [field]: "" }, // Clear field error
    }));
  }, []);

  const updateMultipleFields = useCallback((updates: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, ...updates },
      isDirty: true,
    }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, []);

  const setErrors = useCallback((errors: Partial<Record<keyof T, string>>) => {
    setState((prev) => ({
      ...prev,
      errors,
    }));
  }, []);

  const validate = useCallback(() => {
    if (!validationSchema) return true;

    const errors = validationSchema(state.data);
    const hasErrors = Object.keys(errors).length > 0;

    setState((prev) => ({
      ...prev,
      errors,
    }));

    return !hasErrors;
  }, [state.data, validationSchema]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!onSubmit) return;

      if (!validate()) return;

      setState((prev) => ({ ...prev, isSubmitting: true }));

      try {
        await onSubmit(state.data);
        setState((prev) => ({ ...prev, isDirty: false }));
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [state.data, onSubmit, validate]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      errors: {},
      isSubmitting: false,
      isDirty: false,
    });
  }, [initialData]);

  return {
    ...state,
    updateField,
    updateMultipleFields,
    setError,
    setErrors,
    validate,
    handleSubmit,
    reset,
  };
};

import { useCallback, useState } from 'react';

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void> | void
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [name]: value }));
      if (errors[name as string]) {
        const newErrors = { ...errors };
        delete newErrors[name as string];
        setErrors(newErrors);
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);
      setErrors({});
      setSuccessMessage(null);

      try {
        await onSubmit(values);
        setSuccessMessage('操作が完了しました');
      } catch (_error: unknown) {
        if (_error instanceof Error) {
          setErrors({ submit: _error?.message || 'エラーが発生しました' });
        } else {
          // ... fallback ...
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setSuccessMessage(null);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    successMessage,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors,
    setSuccessMessage,
  };
};

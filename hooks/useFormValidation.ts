// hooks/useFormValidation.ts
import { useState } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any, allValues?: Record<string, any>) => string | undefined;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = (name: keyof T, value: any): string | undefined => {
    const rule = validationRules[name as string];
    if (!rule) return undefined;

    if (rule.required && (!value || value.trim() === '')) {
      return 'This field is required';
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `Minimum ${rule.minLength} characters required`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `Maximum ${rule.maxLength} characters allowed`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return 'Invalid format';
    }

    if (rule.custom) {
      return rule.custom(value, values);
    }

    return undefined;
  };

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((key) => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      )
    );

    return isValid;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
  };
};
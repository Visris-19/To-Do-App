
import { useState } from 'react';

export const useFormValidation = (initialState, validationRules) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const validate = (data = formData) => {
    const newErrors = {};

    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = data[field];

      for (const rule of rules) {
        if (!rule.test(value, data)) {
          newErrors[field] = rule.message;
          break;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const dismissError = (field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  return {
    formData,
    errors,
    validate,
    updateField,
    dismissError,
    resetForm,
    setErrors
  };
};
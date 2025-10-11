/**
 * Form Validation Utilities
 * Centralized validation logic for all form inputs
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidation {
  value: any;
  rules: ValidationRule[];
  fieldName: string;
}

/**
 * Validates a single field
 */
export const validateField = (field: FieldValidation): string | null => {
  const { value, rules, fieldName } = field;

  for (const rule of rules) {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rule.message || `${fieldName} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      continue;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || `${fieldName} must be at least ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || `${fieldName} must be no more than ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${fieldName} format is invalid`;
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return customError;
      }
    }
  }

  return null;
};

/**
 * Validates multiple fields
 */
export const validateFields = (fields: FieldValidation[]): ValidationResult => {
  const errors: Record<string, string> = {};

  fields.forEach(field => {
    const error = validateField(field);
    if (error) {
      errors[field.fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Common validation rules
 */
export const VALIDATION_RULES = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || 'This field is required',
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    minLength: min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    maxLength: max,
    message: message || `Must be no more than ${max} characters`,
  }),

  email: (message?: string): ValidationRule => ({
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: message || 'Please enter a valid email address',
  }),

  url: (message?: string): ValidationRule => ({
    pattern: /^https?:\/\/.+/,
    message: message || 'Please enter a valid URL',
  }),

  searchQuery: (message?: string): ValidationRule => ({
    required: true,
    minLength: 3,
    maxLength: 200,
    message: message || 'Search query must be 3-200 characters',
  }),

  subtopicSelection: (message?: string): ValidationRule => ({
    custom: (value: string[]) => {
      if (!value || value.length === 0) {
        return message || 'Please select at least one subtopic';
      }
      return null;
    },
  }),

  offerSelection: (message?: string): ValidationRule => ({
    custom: (value: string[]) => {
      if (!value || value.length === 0) {
        return message || 'Please select at least one affiliate offer';
      }
      return null;
    },
  }),

  trendSelection: (message?: string): ValidationRule => ({
    custom: (value: string[]) => {
      if (!value || value.length === 0) {
        return message || 'Please select at least one trend';
      }
      return null;
    },
  }),

  contentIdeaSelection: (message?: string): ValidationRule => ({
    custom: (value: string[]) => {
      if (!value || value.length === 0) {
        return message || 'Please select at least one content idea';
      }
      return null;
    },
  }),

  clusterSelection: (message?: string): ValidationRule => ({
    custom: (value: string[]) => {
      if (!value || value.length === 0) {
        return message || 'Please select at least one keyword cluster';
      }
      return null;
    },
  }),

  fileUpload: (allowedTypes: string[], message?: string): ValidationRule => ({
    custom: (value: File | null) => {
      if (!value) {
        return message || 'Please select a file';
      }
      if (!allowedTypes.includes(value.type)) {
        return message || `File must be one of: ${allowedTypes.join(', ')}`;
      }
      return null;
    },
  }),

  csvFile: (message?: string): ValidationRule => ({
    custom: (value: File | null) => {
      if (!value) {
        return message || 'Please select a CSV file';
      }
      if (!value.name.toLowerCase().endsWith('.csv')) {
        return message || 'File must be a CSV file';
      }
      return null;
    },
  }),
} as const;

/**
 * Workflow-specific validation schemas
 */
export const WORKFLOW_VALIDATION_SCHEMAS = {
  topicDecomposition: {
    searchQuery: [VALIDATION_RULES.searchQuery()],
  },

  affiliateResearch: {
    selectedSubtopics: [VALIDATION_RULES.subtopicSelection()],
  },

  trendAnalysis: {
    selectedSubtopics: [VALIDATION_RULES.subtopicSelection()],
  },

  contentGeneration: {
    selectedTrends: [VALIDATION_RULES.trendSelection()],
    selectedOffers: [VALIDATION_RULES.offerSelection()],
  },

  keywordClustering: {
    selectedIdeas: [VALIDATION_RULES.contentIdeaSelection()],
  },

  externalToolIntegration: {
    file: [VALIDATION_RULES.csvFile()],
    toolName: [VALIDATION_RULES.required('Please select a tool')],
  },
} as const;

/**
 * Validates workflow step data
 */
export const validateWorkflowStep = (step: string, data: Record<string, any>): ValidationResult => {
  const schema = WORKFLOW_VALIDATION_SCHEMAS[step as keyof typeof WORKFLOW_VALIDATION_SCHEMAS];
  
  if (!schema) {
    return { isValid: true, errors: {} };
  }

  const fields: FieldValidation[] = Object.entries(schema).map(([fieldName, rules]) => ({
    value: data[fieldName],
    rules: [...rules], // Convert readonly array to mutable array
    fieldName,
  }));

  return validateFields(fields);
};

/**
 * Real-time validation hook (requires React)
 * This hook should be used in React components
 */
export const createValidationHook = () => {
  // This would be implemented in a React component file
  return {
    validateField: (fieldName: string, value: any, rules: ValidationRule[]) => {
      const field: FieldValidation = { value, rules, fieldName };
      return validateField(field);
    },
    validateAll: (data: Record<string, any>, schema: Record<string, ValidationRule[]>) => {
      const fields: FieldValidation[] = Object.entries(schema).map(([fieldName, rules]) => ({
        value: data[fieldName],
        rules,
        fieldName,
      }));

      return validateFields(fields);
    },
  };
};

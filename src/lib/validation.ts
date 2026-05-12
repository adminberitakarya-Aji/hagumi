/**
 * Validation utilities for frontend forms and inputs
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Email validation
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
    return { valid: false, errors };
  }
  
  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length > 255) {
    errors.push({ field: 'email', message: 'Email is too long (max 255 characters)' });
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Password validation
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
    return { valid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  
  if (password.length > 128) {
    errors.push({ field: 'password', message: 'Password is too long (max 128 characters)' });
  }
  
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUpper) {
    errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
  }
  if (!hasLower) {
    errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' });
  }
  if (!hasNumber) {
    errors.push({ field: 'password', message: 'Password must contain at least one number' });
  }
  if (!hasSpecial) {
    errors.push({ field: 'password', message: 'Password must contain at least one special character' });
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Username validation
 */
export const validateUsername = (username: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!username) {
    errors.push({ field: 'username', message: 'Username is required' });
    return { valid: false, errors };
  }
  
  const trimmedUsername = username.trim();
  
  if (trimmedUsername.length < 3) {
    errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
  }
  
  if (trimmedUsername.length > 30) {
    errors.push({ field: 'username', message: 'Username is too long (max 30 characters)' });
  }
  
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  if (!usernameRegex.test(trimmedUsername)) {
    errors.push({ field: 'username', message: 'Username can only contain letters, numbers, underscores, and hyphens' });
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Pet name validation
 */
export const validatePetName = (name: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!name) {
    errors.push({ field: 'petName', message: 'Pet name is required' });
    return { valid: false, errors };
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 1) {
    errors.push({ field: 'petName', message: 'Pet name must be at least 1 character' });
  }
  
  if (trimmedName.length > 20) {
    errors.push({ field: 'petName', message: 'Pet name is too long (max 20 characters)' });
  }
  
  // Allow letters, numbers, spaces, and common Unicode characters
  const petNameRegex = /^[a-zA-Z0-9\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\s]{1,20}$/;
  if (!petNameRegex.test(trimmedName)) {
    errors.push({ field: 'petName', message: 'Pet name contains invalid characters' });
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * String validation
 */
export const validateString = (
  value: string,
  fieldName: string,
  minLength: number,
  maxLength: number
): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!value) {
    errors.push({ field: fieldName, message: `${fieldName} is required` });
    return { valid: false, errors };
  }
  
  const trimmedValue = value.trim();
  
  if (trimmedValue.length < minLength) {
    errors.push({ field: fieldName, message: `${fieldName} must be at least ${minLength} characters` });
  }
  
  if (trimmedValue.length > maxLength) {
    errors.push({ field: fieldName, message: `${fieldName} is too long (max ${maxLength} characters)` });
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Number validation
 */
export const validateNumber = (
  value: number,
  fieldName: string,
  min: number,
  max: number
): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (isNaN(value)) {
    errors.push({ field: fieldName, message: `${fieldName} must be a valid number` });
    return { valid: false, errors };
  }
  
  if (value < min) {
    errors.push({ field: fieldName, message: `${fieldName} must be at least ${min}` });
  }
  
  if (value > max) {
    errors.push({ field: fieldName, message: `${fieldName} must be at most ${max}` });
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * URL validation
 */
export const validateURL = (url: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!url) {
    errors.push({ field: 'url', message: 'URL is required' });
    return { valid: false, errors };
  }
  
  try {
    const parsedURL = new URL(url);
    
    // Check for dangerous protocols
    if (parsedURL.protocol === 'javascript:') {
      errors.push({ field: 'url', message: 'Invalid URL protocol' });
    }
  } catch {
    errors.push({ field: 'url', message: 'Invalid URL format' });
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  if (!input) return input;
  
  let sanitized = input.trim();
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove script tags
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  
  // Remove XSS patterns
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  sanitized = sanitized.replace(/<iframe/gi, '');
  sanitized = sanitized.replace(/<object/gi, '');
  sanitized = sanitized.replace(/<embed/gi, '');
  
  // Escape HTML entities
  const div = document.createElement('div');
  div.textContent = sanitized;
  sanitized = div.innerHTML;
  
  return sanitized;
};

/**
 * Sanitize email
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return email;
  
  let sanitized = email.trim().toLowerCase();
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  
  return sanitized;
};

/**
 * Sanitize pet name
 */
export const sanitizePetName = (name: string): string => {
  if (!name) return name;
  
  let sanitized = name.trim();
  
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
  
  // Remove SQL injection patterns
  sanitized = sanitized.replace(/['";\-]/g, '');
  
  return sanitized;
};

/**
 * Validate multiple fields
 */
export const validateMultiple = (validations: ValidationResult[]): ValidationResult => {
  const allErrors: ValidationError[] = [];
  
  for (const validation of validations) {
    allErrors.push(...validation.errors);
  }
  
  return { valid: allErrors.length === 0, errors: allErrors };
};

/**
 * Get first error message
 */
export const getFirstError = (validation: ValidationResult): string | null => {
  if (validation.errors.length > 0) {
    return validation.errors[0].message;
  }
  return null;
};

/**
 * Format validation errors for display
 */
export const formatErrors = (validation: ValidationResult): Record<string, string> => {
  const formatted: Record<string, string> = {};
  
  for (const error of validation.errors) {
    formatted[error.field] = error.message;
  }
  
  return formatted;
};
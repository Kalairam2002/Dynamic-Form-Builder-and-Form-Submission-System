// Mirrors the main server rules so people get feedback before submitting.
// The server still validates everything on its own.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?\d{7,15}$/;

function isEmpty(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function checkLength(value, field) {
  const length = value.trim().length;
  if (field.minLength != null && length < field.minLength) {
    return `Must be at least ${field.minLength} characters`;
  }
  if (field.maxLength != null && length > field.maxLength) {
    return `Must be at most ${field.maxLength} characters`;
  }
  return '';
}

function checkEmail(value) {
  return EMAIL_PATTERN.test(value.trim()) ? '' : 'Enter a valid email address';
}

function checkPhone(value) {
  const phone = value.replace(/[\s\-().]/g, '');
  return PHONE_PATTERN.test(phone) ? '' : 'Enter a valid phone number (7 to 15 digits)';
}

function checkNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Must be a number';
  if (field.min != null && number < field.min) return `Must be at least ${field.min}`;
  if (field.max != null && number > field.max) return `Must be at most ${field.max}`;
  return '';
}

const CHECKS = {
  text: checkLength,
  textarea: checkLength,
  email: checkEmail,
  phone: checkPhone,
  number: checkNumber,
};

export function validateField(field, value) {
  if (isEmpty(value)) return field.required ? 'This field is required' : '';

  const check = CHECKS[field.type];
  return check ? check(value, field) : '';
}

const { cleanText } = require('../utils/sanitize');

// Each type has a parse(value, field) function that returns { value } with the cleaned
// value, or { error }. Adding a new field type only needs a new entry in fieldTypes below.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;
// Checked after removing spaces, dashes, dots and brackets.
const PHONE_PATTERN = /^\+?\d{7,15}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const TEXT_LIMIT = 500;
const TEXTAREA_LIMIT = 5000;

function isEmpty(value) {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function checkLength(text, field, hardLimit) {
  const maxLength = Math.min(field.maxLength ?? hardLimit, hardLimit);

  if (field.minLength != null && text.length < field.minLength) {
    return { error: `Must be at least ${field.minLength} characters` };
  }
  if (text.length > maxLength) {
    return { error: `Must be at most ${maxLength} characters` };
  }
  return { value: text };
}

function parseText(value, field) {
  if (typeof value !== 'string') return { error: 'Must be text' };
  return checkLength(cleanText(value), field, TEXT_LIMIT);
}

function parseTextarea(value, field) {
  if (typeof value !== 'string') return { error: 'Must be text' };
  return checkLength(cleanText(value), field, TEXTAREA_LIMIT);
}

function parseEmail(value) {
  if (typeof value !== 'string') return { error: 'Enter a valid email address' };

  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { error: 'Enter a valid email address' };
  }
  return { value: email };
}

function parseNumber(value, field) {
  let number = value;
  if (typeof value === 'string') {
    if (!NUMBER_PATTERN.test(value.trim())) return { error: 'Must be a number' };
    number = Number(value.trim());
  }
  if (typeof number !== 'number' || !Number.isFinite(number)) {
    return { error: 'Must be a number' };
  }

  if (field.min != null && number < field.min) return { error: `Must be at least ${field.min}` };
  if (field.max != null && number > field.max) return { error: `Must be at most ${field.max}` };
  return { value: number };
}

function parsePhone(value) {
  if (typeof value !== 'string') return { error: 'Enter a valid phone number' };

  const phone = value.replace(/[\s\-().]/g, '');
  if (!PHONE_PATTERN.test(phone)) {
    return { error: 'Enter a valid phone number (7 to 15 digits)' };
  }
  return { value: phone };
}

function parseDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    return { error: 'Enter a valid date' };
  }

  // Catches dates like 2024-02-31 that match the pattern but do not exist.
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return { error: 'Enter a valid date' };
  }
  return { value };
}

function parseOption(value, field) {
  const options = field.options || [];
  if (typeof value !== 'string' || !options.includes(value)) {
    return { error: 'Choose one of the available options' };
  }
  return { value };
}

function parseCheckbox(value, field) {
  const options = field.options || [];
  if (!Array.isArray(value)) return { error: 'Choose from the available options' };

  const allValid = value.every((item) => typeof item === 'string' && options.includes(item));
  if (!allValid) return { error: 'Choose from the available options' };

  return { value: [...new Set(value)] };
}

const fieldTypes = {
  text: { parse: parseText },
  email: { parse: parseEmail },
  number: { parse: parseNumber },
  phone: { parse: parsePhone },
  textarea: { parse: parseTextarea },
  date: { parse: parseDate },
  select: { parse: parseOption, hasOptions: true },
  radio: { parse: parseOption, hasOptions: true },
  checkbox: { parse: parseCheckbox, hasOptions: true },
};

const FIELD_TYPES = Object.keys(fieldTypes);

module.exports = { fieldTypes, FIELD_TYPES, isEmpty };

const { fieldTypes, isEmpty } = require('./fieldTypes');
const { HttpError } = require('../utils/errors');

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validateField(field, value) {
  if (isEmpty(value)) {
    return field.required ? { error: 'This field is required' } : {};
  }

  const result = fieldTypes[field.type].parse(value, field);

  // Text made only of stripped HTML ends up empty after cleaning.
  if (!result.error && field.required && isEmpty(result.value)) {
    return { error: 'This field is required' };
  }
  return result;
}

// Builds the saved data only from keys defined on the form, so anything
// extra in the payload is dropped instead of being stored.
function validateSubmission(form, body) {
  const values = body?.data;
  if (!isPlainObject(values)) {
    throw new HttpError(400, 'Submission data is missing', { data: 'Expected an object of field values' });
  }

  const data = {};
  const errors = {};

  for (const field of form.fields) {
    // Object.hasOwn avoids picking up inherited names like "constructor".
    const value = Object.hasOwn(values, field.key) ? values[field.key] : undefined;
    const result = validateField(field, value);

    if (result.error) {
      errors[field.key] = result.error;
    } else if (result.value !== undefined) {
      data[field.key] = result.value;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, 'Please fix the highlighted fields', errors);
  }
  return data;
}

module.exports = { validateSubmission };

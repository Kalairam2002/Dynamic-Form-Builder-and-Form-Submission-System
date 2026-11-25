const { z } = require('zod');
const { fieldTypes, FIELD_TYPES, isEmpty } = require('./fieldTypes');
const { cleanText } = require('../utils/sanitize');
const { HttpError } = require('../utils/errors');

// Keys become property names in submission data, so keep them simple and predictable.
const KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;

const text = (max) => z.string().max(max).transform(cleanText);

function addIssue(ctx, path, message) {
  ctx.addIssue({ code: 'custom', path, message });
}

function checkOptions(field, ctx) {
  const options = field.options || [];

  if (options.length === 0) {
    addIssue(ctx, ['options'], 'Add at least one option');
  } else if (options.includes('')) {
    addIssue(ctx, ['options'], 'Options cannot be empty');
  } else if (new Set(options).size !== options.length) {
    addIssue(ctx, ['options'], 'Options must be unique');
  }
}

function checkRanges(field, ctx) {
  if (field.minLength != null && field.maxLength != null && field.minLength > field.maxLength) {
    addIssue(ctx, ['maxLength'], 'Max length must be greater than min length');
  }
  if (field.min != null && field.max != null && field.min > field.max) {
    addIssue(ctx, ['max'], 'Max value must be greater than min value');
  }
}

// The default value must itself pass the field's own rules, otherwise the
// public form would start with a value the backend later rejects.
function normalizeDefault(field, ctx) {
  if (isEmpty(field.defaultValue)) return null;

  const result = fieldTypes[field.type].parse(field.defaultValue, field);
  if (result.error) {
    addIssue(ctx, ['defaultValue'], `Default value: ${result.error}`);
    return null;
  }
  return result.value;
}

function normalizeField(field, ctx) {
  if (fieldTypes[field.type].hasOptions) {
    checkOptions(field, ctx);
  } else {
    delete field.options;
  }

  checkRanges(field, ctx);
  field.defaultValue = normalizeDefault(field, ctx);
  return field;
}

const fieldSchema = z
  .object({
    key: z
      .string()
      .trim()
      .min(1, 'Key is required')
      .max(50, 'Key must be at most 50 characters')
      .regex(KEY_PATTERN, 'Key must start with a letter and use only letters, numbers or _'),
    label: text(150).refine((value) => value.length > 0, 'Label is required'),
    type: z.enum(FIELD_TYPES, { message: 'Unknown field type' }),
    placeholder: text(150).default(''),
    defaultValue: z
      .union([z.string().max(1000), z.number(), z.array(z.string().max(200)).max(100)])
      .nullish(),
    required: z.boolean().default(false),
    options: z.array(text(100)).max(100, 'A field can have at most 100 options').optional(),
    minLength: z.number().int().min(0).nullish(),
    maxLength: z.number().int().min(1).nullish(),
    min: z.number().nullish(),
    max: z.number().nullish(),
  })
  .transform(normalizeField);

function checkForm(form, ctx) {
  const usedKeys = new Set();

  form.fields.forEach((field, index) => {
    if (usedKeys.has(field.key)) {
      addIssue(ctx, ['fields', index, 'key'], `Key "${field.key}" is used more than once`);
    }
    usedKeys.add(field.key);
  });

  if (form.status === 'published' && form.fields.length === 0) {
    addIssue(ctx, ['fields'], 'Add at least one field before publishing');
  }
}

const formSchema = z
  .object({
    name: text(150).refine((value) => value.length > 0, 'Form name is required'),
    description: text(1000).default(''),
    status: z.enum(['draft', 'published']).default('draft'),
    fields: z.array(fieldSchema).max(100, 'A form can have at most 100 fields'),
  })
  .superRefine(checkForm);

// Returns the cleaned form definition or throws a 400 with errors keyed by path,
// for example { "fields.2.key": "Key is required" }.
function parseForm(body) {
  const result = formSchema.safeParse(body);
  if (result.success) return result.data;

  const errors = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.') || 'form';
    if (!errors[path]) errors[path] = issue.message;
  }
  throw new HttpError(400, 'Please fix the errors in the form', errors);
}

module.exports = { parseForm };

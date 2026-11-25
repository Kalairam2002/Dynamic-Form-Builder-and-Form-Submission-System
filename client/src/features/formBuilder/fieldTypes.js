// What the builder needs to know about each field type. The public form has its own
// map of type -> component in components/fields.
export const FIELD_TYPES = {
  text: { label: 'Short text', hasPlaceholder: true, hasLength: true },
  email: { label: 'Email', hasPlaceholder: true },
  number: { label: 'Number', hasPlaceholder: true, hasRange: true },
  phone: { label: 'Phone', hasPlaceholder: true },
  textarea: { label: 'Paragraph', hasPlaceholder: true, hasLength: true },
  date: { label: 'Date' },
  select: { label: 'Dropdown', hasPlaceholder: true, hasOptions: true },
  radio: { label: 'Single choice', hasOptions: true },
  checkbox: { label: 'Checkboxes', hasOptions: true },
};

export function getFieldType(type) {
  return FIELD_TYPES[type] || { label: type };
}

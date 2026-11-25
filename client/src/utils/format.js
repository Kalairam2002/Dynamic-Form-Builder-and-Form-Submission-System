const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function formatDate(value) {
  if (!value) return '-';
  return dateFormatter.format(new Date(value));
}

export function formatValue(value) {
  if (value === undefined || value === null || value === '') return '-';
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '-';
  return String(value);
}

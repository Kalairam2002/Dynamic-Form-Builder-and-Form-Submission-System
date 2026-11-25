import { inputClasses } from '../ui/Input';

const HTML_TYPES = { email: 'email', number: 'number', phone: 'tel', date: 'date' };
const AUTOCOMPLETE = { email: 'email', phone: 'tel' };

export default function TextInput({ id, field, value, hasError, onChange }) {
  return (
    <input
      id={id}
      name={field.key}
      type={HTML_TYPES[field.type] || 'text'}
      step={field.type === 'number' ? 'any' : undefined}
      min={field.min ?? undefined}
      max={field.max ?? undefined}
      maxLength={field.maxLength ?? undefined}
      autoComplete={AUTOCOMPLETE[field.type]}
      placeholder={field.placeholder}
      className={inputClasses(hasError)}
      aria-invalid={hasError}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

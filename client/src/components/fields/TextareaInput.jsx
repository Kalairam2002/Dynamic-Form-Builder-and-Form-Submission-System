import { inputClasses } from '../ui/Input';

export default function TextareaInput({ id, field, value, hasError, onChange }) {
  return (
    <textarea
      id={id}
      name={field.key}
      rows={4}
      maxLength={field.maxLength ?? undefined}
      placeholder={field.placeholder}
      className={inputClasses(hasError)}
      aria-invalid={hasError}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

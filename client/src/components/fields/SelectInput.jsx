import { inputClasses } from '../ui/Input';

export default function SelectInput({ id, field, value, hasError, onChange }) {
  return (
    <select
      id={id}
      name={field.key}
      className={inputClasses(hasError)}
      aria-invalid={hasError}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">{field.placeholder || 'Select an option'}</option>
      {field.options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

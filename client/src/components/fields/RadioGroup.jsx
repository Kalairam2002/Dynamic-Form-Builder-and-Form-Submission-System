export default function RadioGroup({ id, labelId, field, value, hasError, onChange }) {
  return (
    <div role="radiogroup" aria-labelledby={labelId} aria-invalid={hasError} className="flex flex-col gap-2">
      {field.options.map((option, index) => (
        <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
          <input
            id={index === 0 ? id : undefined}
            type="radio"
            name={field.key}
            className="size-4 accent-primary-600"
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          {option}
        </label>
      ))}
    </div>
  );
}

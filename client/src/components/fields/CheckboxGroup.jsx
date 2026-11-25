export default function CheckboxGroup({ id, labelId, field, value, hasError, onChange }) {
  const selected = Array.isArray(value) ? value : [];

  function toggle(option) {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(next);
  }

  return (
    <div role="group" aria-labelledby={labelId} aria-invalid={hasError} className="flex flex-col gap-2">
      {field.options.map((option, index) => (
        <label key={option} className="flex items-center gap-2 text-sm text-gray-700">
          <input
            id={index === 0 ? id : undefined}
            type="checkbox"
            name={field.key}
            className="size-4 accent-primary-600"
            checked={selected.includes(option)}
            onChange={() => toggle(option)}
          />
          {option}
        </label>
      ))}
    </div>
  );
}

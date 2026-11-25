export function inputClasses(hasError) {
  const border = hasError
    ? 'border-danger-600 focus:border-danger-600 focus:ring-danger-200'
    : 'border-gray-300 focus:border-primary-600 focus:ring-primary-100';

  return `block w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-white border ${border} rounded-md shadow-sm outline-none focus:ring-3 disabled:bg-gray-100`;
}

export function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block mb-1 text-sm font-medium text-gray-700">
      {children}
    </label>
  );
}

export function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-danger-600">{message}</p>;
}

export default function Input({ id, label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <input id={id} className={inputClasses(Boolean(error))} aria-invalid={Boolean(error)} {...props} />
      <FieldError message={error} />
    </div>
  );
}

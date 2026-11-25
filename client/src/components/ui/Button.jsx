const VARIANTS = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  danger: 'bg-danger-600 text-white hover:bg-danger-700',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  // Quiet in a row of buttons, but turns solid red on hover so a delete is obvious.
  dangerSubtle: 'text-danger-600 hover:bg-danger-600 hover:text-white',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

// Also used on <Link> elements that should look like buttons.
export function buttonClasses(variant = 'primary', size = 'md') {
  return `inline-flex items-center justify-center gap-2 ${SIZES[size]} font-medium ${VARIANTS[variant]} rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-60`;
}

export default function Button({ variant, size, type = 'button', className = '', ...props }) {
  return <button type={type} className={`${buttonClasses(variant, size)} ${className}`} {...props} />;
}

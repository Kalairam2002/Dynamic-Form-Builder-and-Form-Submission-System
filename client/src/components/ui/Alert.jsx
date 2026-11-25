const VARIANTS = {
  error: 'bg-danger-50 text-danger-700 border-danger-200',
  success: 'bg-success-50 text-success-700 border-success-200',
};

export default function Alert({ variant = 'error', className = '', children }) {
  if (!children) return null;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`px-4 py-3 text-sm ${VARIANTS[variant]} border rounded-md ${className}`}
    >
      {children}
    </div>
  );
}

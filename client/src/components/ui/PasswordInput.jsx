import { useState } from 'react';
import { FieldError, Label, inputClasses } from './Input';
import { EyeIcon, EyeOffIcon } from './Icons';

export default function PasswordInput({ id, label, error, className = '', ...props }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <input
          id={id}
          type={isVisible ? 'text' : 'password'}
          className={`${inputClasses(Boolean(error))} pr-11`}
          aria-invalid={Boolean(error)}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-400 rounded-r-md hover:text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-500"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          aria-controls={id}
          // Keeps focus (and the mobile keyboard) on the input when the icon is tapped.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}

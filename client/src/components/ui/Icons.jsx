// Small inline SVG icons, so the app does not need an icon library.
// They use currentColor, so the text color class on the parent sets their color.

function Icon({ className = 'size-5', children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function FormIcon({ className }) {
  return (
    <Icon className={className}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </Icon>
  );
}

export function CheckIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Icon>
  );
}

export function ChevronUpIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M6 15l6-6 6 6" />
    </Icon>
  );
}

export function ChevronDownIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function PlusIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function InboxIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M3 13l2.5-7.5A2 2 0 0 1 7.4 4h9.2a2 2 0 0 1 1.9 1.5L21 13" />
      <path d="M3 13v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5h-5l-1.5 2h-5L8 13H3z" />
    </Icon>
  );
}

export function EyeIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOffIcon({ className }) {
  return (
    <Icon className={className}>
      <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.9 3.9" />
      <path d="M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.4" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M2 2l20 20" />
    </Icon>
  );
}

const cx = (...parts) => parts.filter(Boolean).join(" ");

function BaseIcon({ className = "", children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx("h-5 w-5", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export function MailIcon(props) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4.5 7l7.5 6 7.5-6" />
    </BaseIcon>
  );
}

export function LockIcon(props) {
  return (
    <BaseIcon {...props}>
      <rect x="5" y="10" width="14" height="10" rx="2.5" />
      <path d="M8 10V8a4 4 0 118 0v2" />
    </BaseIcon>
  );
}

export function EyeIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
      <circle cx="12" cy="12" r="3" />
    </BaseIcon>
  );
}

export function EyeOffIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.7 5.2A10.8 10.8 0 0112 5c6 0 9.5 7 9.5 7a17.6 17.6 0 01-3 3.8" />
      <path d="M6.3 6.4A17.1 17.1 0 002.5 12s3.5 7 9.5 7c1.4 0 2.7-.3 3.8-.8" />
      <path d="M9.9 9.9A3 3 0 0014.1 14.1" />
    </BaseIcon>
  );
}

export function UserIcon(props) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0114 0" />
    </BaseIcon>
  );
}

export function ShieldIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3l7 3v5c0 4.5-2.7 7.7-7 10-4.3-2.3-7-5.5-7-10V6l7-3z" />
      <path d="M9.5 12.5l1.8 1.8 3.7-4.1" />
    </BaseIcon>
  );
}

export function KeyIcon(props) {
  return (
    <BaseIcon {...props}>
      <circle cx="8.5" cy="14.5" r="3.5" />
      <path d="M11 12l8-8" />
      <path d="M17 4h3v3" />
      <path d="M14.5 6.5l3 3" />
    </BaseIcon>
  );
}

export function PhoneIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M6.7 4.8l2 3.8-1.5 1.5a14.5 14.5 0 006.3 6.3l1.5-1.5 3.8 2c.8.4 1.1 1.4.6 2.1l-1 1.5c-.5.8-1.4 1.2-2.3 1A19.3 19.3 0 013.5 8.7c-.2-.9.2-1.8 1-2.3l1.5-1c.8-.5 1.7-.2 2.2.6z" />
    </BaseIcon>
  );
}

export function MapPinIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M12 20s6-5.4 6-10.2A6 6 0 106 9.8C6 14.6 12 20 12 20z" />
      <circle cx="12" cy="9.5" r="2.2" />
    </BaseIcon>
  );
}

export function SparklesIcon(props) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3l1.3 4.2L17.5 8.5l-4.2 1.3L12 14l-1.3-4.2L6.5 8.5l4.2-1.3L12 3z" />
      <path d="M19 14l.7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14z" />
      <path d="M5 15l.9 2.8L8.7 19l-2.8.9L5 22l-.9-2.1L1.3 19l2.8-1.2L5 15z" />
    </BaseIcon>
  );
}

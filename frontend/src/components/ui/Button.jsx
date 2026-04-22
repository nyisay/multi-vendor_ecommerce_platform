const cx = (...parts) => parts.filter(Boolean).join(" ");

const VARIANTS = {
  primary: "border border-blue-700 bg-blue-700 text-white shadow-sm hover:bg-blue-800",
  secondary: "border border-teal-600 bg-teal-600 text-white shadow-sm hover:bg-teal-700",
  outline: "border border-slate-300 bg-white text-slate-900 hover:border-blue-300 hover:bg-blue-50",
  ghost: "text-slate-800 hover:bg-slate-100",
  danger: "border border-red-700 bg-red-700 text-white shadow-sm hover:bg-red-800",
};

const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

export default function Button({
  type = "button",
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center rounded-xl font-semibold tracking-tight transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/35 disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        fullWidth ? "w-full" : "",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}


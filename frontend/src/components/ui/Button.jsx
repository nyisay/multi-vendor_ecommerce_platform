const cx = (...parts) => parts.filter(Boolean).join(" ");

const VARIANTS = {
  primary:
    "border border-slate-950 bg-slate-950 text-white shadow-[0_18px_35px_-20px_rgba(15,23,42,0.72)] hover:bg-slate-800",
  secondary:
    "border border-amber-200 bg-amber-300 text-slate-950 shadow-[0_18px_35px_-22px_rgba(251,191,36,0.8)] hover:bg-amber-200",
  outline:
    "border border-slate-200 bg-white text-slate-900 hover:border-amber-200 hover:bg-amber-50",
  ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
  danger:
    "border border-rose-600 bg-rose-600 text-white shadow-[0_18px_35px_-22px_rgba(225,29,72,0.45)] hover:bg-rose-700",
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
        "inline-flex items-center justify-center rounded-xl font-semibold tracking-tight transition duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60",
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


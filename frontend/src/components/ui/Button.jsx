const cx = (...parts) => parts.filter(Boolean).join(" ");

const VARIANTS = {
  primary: "bg-[#91ADC2] text-white hover:bg-[#9BA0BC]",
  secondary: "bg-[#9BA0BC] text-white hover:bg-[#7A8B99]",
  outline: "border border-[#91ADC2]/40 bg-white text-gray-900 hover:bg-[#A9DDD6]/30",
  ghost: "text-gray-900 hover:bg-gray-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-sm",
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
        "inline-flex items-center justify-center rounded-2xl font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#91ADC2]/35 disabled:cursor-not-allowed disabled:opacity-60",
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


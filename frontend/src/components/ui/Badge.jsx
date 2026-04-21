const cx = (...parts) => parts.filter(Boolean).join(" ");

const VARIANTS = {
  neutral: "bg-gray-100 text-gray-800",
  dark: "bg-[#9BA0BC] text-white",
  success: "bg-green-600 text-white",
  danger: "bg-red-600 text-white",
};

export default function Badge({ variant = "neutral", className = "", children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
        VARIANTS[variant] || VARIANTS.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}


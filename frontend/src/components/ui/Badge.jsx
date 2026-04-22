const cx = (...parts) => parts.filter(Boolean).join(" ");

const VARIANTS = {
  neutral: "border border-slate-200 bg-slate-100 text-slate-700",
  dark: "bg-slate-800 text-white",
  success: "bg-emerald-600 text-white",
  danger: "bg-red-700 text-white",
};

export default function Badge({ variant = "neutral", className = "", children }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.08em]",
        VARIANTS[variant] || VARIANTS.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}


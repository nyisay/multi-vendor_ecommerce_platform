const cx = (...parts) => parts.filter(Boolean).join(" ");

const VARIANTS = {
  neutral: "border border-amber-200 bg-amber-50 text-slate-800",
  dark: "bg-slate-950 text-white",
  success: "border border-emerald-200 bg-emerald-50 text-emerald-900",
  danger: "border border-rose-200 bg-rose-50 text-rose-800",
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


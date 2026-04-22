const cx = (...parts) => parts.filter(Boolean).join(" ");

export default function Select({ className = "", children, ...props }) {
  return (
    <select
      className={cx(
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 outline-none transition focus:border-amber-300 focus:bg-amber-50/30 focus:ring-2 focus:ring-amber-200/60 disabled:cursor-not-allowed disabled:bg-slate-100",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}


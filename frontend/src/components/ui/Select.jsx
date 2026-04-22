const cx = (...parts) => parts.filter(Boolean).join(" ");

export default function Select({ className = "", children, ...props }) {
  return (
    <select
      className={cx(
        "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}


const cx = (...parts) => parts.filter(Boolean).join(" ");

export default function Select({ className = "", children, ...props }) {
  return (
    <select
      className={cx(
        "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm outline-none transition focus:border-[#91ADC2]/55 focus:ring-2 focus:ring-[#91ADC2]/25 disabled:cursor-not-allowed disabled:bg-gray-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}


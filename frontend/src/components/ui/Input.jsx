const cx = (...parts) => parts.filter(Boolean).join(" ");

export default function Input({ className = "", ...props }) {
  return (
    <input
      className={cx(
        "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm outline-none transition placeholder:font-medium placeholder:text-gray-400 focus:border-[#91ADC2]/55 focus:ring-2 focus:ring-[#91ADC2]/25 disabled:cursor-not-allowed disabled:bg-gray-50",
        className,
      )}
      {...props}
    />
  );
}


const cx = (...parts) => parts.filter(Boolean).join(" ");

export default function Input({
  className = "",
  wrapperClassName = "",
  leadingIcon = null,
  trailingAdornment = null,
  ...props
}) {
  const inputClassName = cx(
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:bg-amber-50/30 focus:ring-2 focus:ring-amber-200/60 disabled:cursor-not-allowed disabled:bg-slate-100",
    leadingIcon ? "pl-11" : "",
    trailingAdornment ? "pr-12" : "",
    className,
  );

  if (!leadingIcon && !trailingAdornment) {
    return <input className={inputClassName} {...props} />;
  }

  return (
    <div className={cx("relative", wrapperClassName)}>
      {leadingIcon ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          {leadingIcon}
        </div>
      ) : null}
      <input className={inputClassName} {...props} />
      {trailingAdornment ? (
        <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
          {trailingAdornment}
        </div>
      ) : null}
    </div>
  );
}


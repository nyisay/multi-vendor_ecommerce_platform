const cx = (...parts) => parts.filter(Boolean).join(" ");

export function Container({ className = "", children }) {
  return <div className={cx("mx-auto w-full max-w-7xl", className)}>{children}</div>;
}

export function SectionHeading({ title, description, right, className = "" }) {
  return (
    <div className={cx("flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h1>
        {description && <p className="mt-1 text-sm font-medium text-slate-600">{description}</p>}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}


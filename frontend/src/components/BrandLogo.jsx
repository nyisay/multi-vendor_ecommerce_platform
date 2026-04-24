const cx = (...parts) => parts.filter(Boolean).join(" ");

export function BrandMark({ className = "" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center justify-center rounded-[1.1rem] bg-[linear-gradient(180deg,_#1f2937_0%,_#0f172a_100%)] text-white shadow-[0_18px_35px_-20px_rgba(15,23,42,0.8)]",
        className,
      )}
    >
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-[70%] w-[70%]">
        <path
          d="M18 28 22 13l10 8 10-8 4 15c5 4 8 10 8 17 0 13-10 23-22 23S10 58 10 45c0-7 3-13 8-17Z"
          fill="#f8fafc"
        />
        <path
          d="M22 14 32 22 42 14"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="36" r="3" fill="#0f172a" />
        <circle cx="40" cy="36" r="3" fill="#0f172a" />
        <path
          d="M32 40c-2.5 0-4 1.6-4 3.1 0 1.2 1.1 2.3 4 2.3s4-1.1 4-2.3c0-1.5-1.5-3.1-4-3.1Z"
          fill="#f59e0b"
        />
        <path
          d="M24 46c1.8 2.2 4.4 3.5 8 3.5s6.2-1.3 8-3.5"
          fill="none"
          stroke="#0f172a"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M18 41h8M17 46h7M38 41h8M40 46h7"
          fill="none"
          stroke="#0f172a"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default function BrandLogo({
  className = "",
  markClassName = "h-11 w-11",
  nameClassName = "",
  taglineClassName = "",
  tagline = "Whisker-approved marketplace",
  showTagline = true,
}) {
  return (
    <div className={cx("flex items-center gap-3", className)}>
      <BrandMark className={markClassName} />
      <div>
        <p className={cx("font-black tracking-[-0.03em] text-slate-950", nameClassName)}>
          PawsieMart
        </p>
        {showTagline ? (
          <p className={cx("text-slate-500", taglineClassName)}>{tagline}</p>
        ) : null}
      </div>
    </div>
  );
}

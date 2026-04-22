const cx = (...parts) => parts.filter(Boolean).join(" ");

export function Card({ className = "", children }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={cx("border-b border-slate-100 p-6", className)}>{children}</div>;
}

export function CardBody({ className = "", children }) {
  return <div className={cx("p-6", className)}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  return <div className={cx("border-t border-slate-100 p-6", className)}>{children}</div>;
}

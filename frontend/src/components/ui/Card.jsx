const cx = (...parts) => parts.filter(Boolean).join(" ");

export function Card({ className = "", children }) {
  return (
    <div className={cx("rounded-3xl border border-gray-200 bg-white shadow-sm", className)}>{children}</div>
  );
}

export function CardHeader({ className = "", children }) {
  return <div className={cx("border-b border-gray-100 p-6", className)}>{children}</div>;
}

export function CardBody({ className = "", children }) {
  return <div className={cx("p-6", className)}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  return <div className={cx("border-t border-gray-100 p-6", className)}>{children}</div>;
}


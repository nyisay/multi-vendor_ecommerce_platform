import { useCallback, useMemo, useState } from "react";
import { ToastContext } from "./toastContextObject";

let toastCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info") => {
      const id = `${Date.now()}-${toastCounter++}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 2800);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <style>{`
        @keyframes toastEnter {
          0% { opacity: 0; transform: translateY(-14px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-3 px-4"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto inline-flex w-fit max-w-[min(92vw,420px)] items-center justify-center rounded-[1.15rem] border px-4 py-2.5 text-center text-sm font-semibold leading-5 text-white shadow-[0_18px_40px_-26px_rgba(15,23,42,0.55)] backdrop-blur-sm ${
              toast.type === "error"
                ? "border-rose-300/70 bg-rose-600/92"
                : toast.type === "success"
                  ? "border-emerald-300/70 bg-emerald-600/92"
                  : "border-amber-300/60 bg-slate-900/94"
            }`}
            style={{ animation: "toastEnter 220ms ease-out" }}
          >
            <span className="break-words">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

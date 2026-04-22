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
      <div className="fixed left-1/2 top-4 z-50 w-[min(92vw,520px)] -translate-x-1/2 space-y-3" role="status" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-full rounded-2xl border px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm ${
              toast.type === "error"
                ? "border-rose-300/70 bg-rose-600/90"
                : toast.type === "success"
                  ? "border-emerald-300/70 bg-emerald-600/90"
                  : "border-amber-300/60 bg-slate-900/92"
            }`}
            style={{ animation: "toastEnter 220ms ease-out" }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  variant = "danger",
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-slate-200 shadow-lg w-full max-w-sm animate-fade-in p-6">
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center
            ${variant === "danger" ? "bg-red-100" : "bg-amber-100"}`}
          >
            <AlertTriangle
              className={`w-6 h-6 ${variant === "danger" ? "text-red-600" : "text-amber-600"}`}
            />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`btn flex-1 ${
              variant === "danger"
                ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                : "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

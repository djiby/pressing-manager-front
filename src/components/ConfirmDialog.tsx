"use client";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "OK",
  cancelLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md border border-line bg-panel p-4 shadow-[0_20px_60px_rgba(28,42,34,0.2)] sm:p-6">
        <h2
          id="confirm-dialog-title"
          className="font-[family-name:var(--font-display)] text-xl text-foreground sm:text-2xl"
        >
          {title}
        </h2>
        <p className="mt-3 text-sm text-muted">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full border border-line bg-white px-4 py-2.5 text-sm font-medium hover:bg-brand-soft sm:w-auto"
            >
              {cancelLabel ?? "Annuler"}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={
              danger
                ? "w-full bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 sm:w-auto"
                : "w-full bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 sm:w-auto"
            }
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

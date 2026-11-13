import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from ".";

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
  loadingText?: string;
  onConfirm: () => void;
}

/** Confirmation dialog — typically used before a destructive action. */
export function ConfirmModal({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  loading = false,
  loadingText,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      description={description}
      icon={
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            variant === "danger"
              ? "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
              : "bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-300"
          }`}
        >
          <AlertTriangle size={16} />
        </span>
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            loadingText={loadingText}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        {description ?? "Are you sure you want to continue?"}
      </p>
    </Modal>
  );
}
import { CheckCircle2, XCircle } from "lucide-react";
import { Modal } from "../../../common/components/Modal";
import { Button } from "../../../common/components";
export { ConfirmModal } from "../../../common/components/ConfirmModal";

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  closeLabel?: string;
}

/** Success feedback dialog. */
export function SuccessModal({
  open,
  onClose,
  title,
  description,
  closeLabel = "Done",
}: ResultModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      description={description}
      icon={
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
          <CheckCircle2 size={18} />
        </span>
      }
      footer={
        <Button className="w-full" onClick={onClose}>
          {closeLabel}
        </Button>
      }
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        {description ?? "Action completed successfully."}
      </p>
    </Modal>
  );
}

/** Error feedback dialog. */
export function ErrorModal({
  open,
  onClose,
  title,
  description,
  closeLabel = "Close",
}: ResultModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      description={description}
      icon={
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
          <XCircle size={18} />
        </span>
      }
      footer={
        <Button variant="secondary" className="w-full" onClick={onClose}>
          {closeLabel}
        </Button>
      }
    >
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        {description ?? "Something went wrong. Please try again."}
      </p>
    </Modal>
  );
}

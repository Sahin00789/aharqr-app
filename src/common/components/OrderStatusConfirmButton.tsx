import { useState, type ReactNode } from "react";
import { Button, ConfirmModal } from ".";

interface OrderStatusConfirmButtonProps {
  orderNumber: string;
  statusLabel: string;
  onConfirm: () => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function OrderStatusConfirmButton({
  orderNumber,
  statusLabel,
  onConfirm,
  children,
  size = "sm",
  className,
  loading = false,
  disabled = false,
}: OrderStatusConfirmButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size={size}
        className={className}
        loading={loading}
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>
      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        title={`Confirm ${statusLabel.toLowerCase()}?`}
        description={`Move order #${orderNumber} to ${statusLabel}?`}
        confirmLabel={`Confirm ${statusLabel}`}
        onConfirm={() => {
          setOpen(false);
          onConfirm();
        }}
      />
    </>
  );
}

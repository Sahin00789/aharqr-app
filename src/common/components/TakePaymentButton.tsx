import { useState } from "react";
import { BadgeCheck, Banknote, CreditCard, Landmark } from "lucide-react";
import { Button, Badge, Modal } from "./index";
import { ActionMenuItem } from "./ActionMenu";
import {
  formatINRFromRupees,
  canTakePayment,
  paymentStatusLabel,
  PAYMENT_STATUS_TONE,
  type PaymentMethod,
  type StaffOrder,
} from "../../api/ordersApi";
import { useRecordOrderPayment } from "../../hooks/use-orders";
import toast from "react-hot-toast";

const METHODS: { key: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { key: "CASH", label: "Cash", icon: Banknote },
  { key: "UPI", label: "UPI", icon: CreditCard },
  { key: "BANK_TRANSFER", label: "Bank Transfer", icon: Landmark },
];

/**
 * Payment-capture modal. Kept separate from the trigger so callers can render
 * it outside a dropdown/kebab menu without the menu unmounting it.
 */
export function TakePaymentModal({
  order,
  open,
  onClose,
}: {
  order: StaffOrder;
  open: boolean;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("CASH");

  const pay = useRecordOrderPayment({
    onSuccess: () => {
      toast.success("Payment recorded");
      onClose();
    },
    onError: () => toast.error("Could not record payment"),
  });

  function confirm() {
    pay.mutate({ id: order.id, orderType: order.orderType, method });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Banknote size={18} />}
      title="Take Payment"
      description={`${order.orderNumber} · ${formatINRFromRupees(
        order.totalAmount,
      )} to collect`}
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={confirm} loading={pay.isPending}>
            Confirm Payment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-[10px] font-semibold tracking-wide text-zinc-500 uppercase">
            Amount
          </p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatINRFromRupees(order.totalAmount)}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-zinc-500 uppercase">
            Payment method
          </p>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMethod(m.key)}
                  className={`flex h-16 flex-col items-center justify-center gap-1 rounded-xl border text-xs font-semibold transition ${
                    method === m.key
                      ? "border-accent-600 bg-accent-50 text-accent-700 dark:border-accent-400 dark:bg-accent-500/15 dark:text-accent-300"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  }`}
                >
                  <Icon size={18} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/**
 * "Take Payment" action for admins and captains. Renders nothing unless the
 * order is approved-or-later and still unpaid; opens a modal to pick the
 * payment method, then records the payment (marks PAID + ledger settlement).
 */
export function TakePaymentButton({
  order,
  size = "sm",
  className = "",
  menuItem = false,
}: {
  order: StaffOrder;
  size?: "sm" | "md";
  className?: string;
  /** Render as a row inside a kebab/ActionMenu instead of a standalone button. */
  menuItem?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (!canTakePayment(order)) return null;

  return (
    <>
      {menuItem ? (
        <ActionMenuItem
          icon={<BadgeCheck size={14} />}
          label="Take Payment"
          onClick={() => setOpen(true)}
        />
      ) : (
        <Button
          size={size}
          variant="secondary"
          className={className}
          onClick={() => setOpen(true)}
        >
          <BadgeCheck size={14} /> Take Payment
        </Button>
      )}

      <TakePaymentModal
        order={order}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

/** Small badge showing the order's payment status (Paid / Unpaid / etc.). */
export function PaymentStatusBadge({ status }: { status?: string }) {
  return (
    <Badge tone={(PAYMENT_STATUS_TONE[status ?? "UNPAID"] ?? "zinc") as "zinc" | "green" | "amber" | "red" | "indigo"}>
      {paymentStatusLabel(status)}
    </Badge>
  );
}
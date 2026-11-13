import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  Mail,
  MessageCircle,
  Phone,
  Printer,
  Receipt,
  Send,
  UtensilsCrossed,
} from "lucide-react";
import { Modal } from "./Modal";
import { ActionMenuItem } from "./ActionMenu";
import { Button, ErrorBanner, Input } from "./index";
import {
  billFileName,
  downloadBillBlob,
  generateBillBlob,
  logoToDataUrl,
  printBillBlob,
  type BillData,
} from "../../utils/billPdfGenerator";
import { useAuthStore } from "../../stores/auth-store";
import { formatRestaurantAddress, useMyRestaurant } from "../../hooks/use-restaurant";

function inr(amount: number): string {
  return `₹${Number(amount).toFixed(2)}`;
}

interface BillModalProps {
  open: boolean;
  onClose: () => void;
  bill: BillData;
  /** Prefill for the WhatsApp number (e.g. the takeaway customer's phone). */
  phone?: string | null;
}

/**
 * Native web bill preview. Mirrors the A5 PDF layout (header → meta → items →
 * totals → footer) rendered as HTML instead of an iframe, so the bill is
 * instantly readable on any device.
 */
export function BillView({ bill }: { bill: BillData }) {
  const showTax =
    Boolean(bill.showTaxBreakdown) &&
    Number(bill.gstRate ?? 0) > 0 &&
    Number(bill.taxAmount) > 0;
  const inclusive =
    Math.abs(Number(bill.totalAmount) - Number(bill.subtotal)) < 0.005;
  const gstRate = bill.gstRate ?? 5;
  const paid = (bill.paymentStatus ?? "").toUpperCase() === "PAID";

  const created = new Date(bill.createdAt);
  const restaurantName = bill.restaurant?.name?.trim() || "AharQR";
  const phone = bill.restaurant?.phone ?? null;
  const email = bill.restaurant?.email ?? null;
  const address = (bill.restaurant?.address ?? "").trim();
  const parts = bill.restaurant?.addressParts;
  const shortAddress = parts
    ? [parts.villageWard, parts.blockMunicipality, parts.district, parts.state]
        .filter(Boolean)
        .join(", ") ||
      [parts.townCity, parts.locality, parts.district, parts.state]
        .filter(Boolean)
        .join(", ")
    : "";
  const displayAddress =
    shortAddress ||
    (address
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(", ") || address);

  const [logoFailed, setLogoFailed] = useState(false);
  const logoUrl = logoFailed ? null : bill.restaurant?.logo;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
        {/* Brand band */}
        <div className="h-1.5 w-full bg-gradient-to-r from-accent-600 via-accent2-600 to-accent-600" />

        <div className="px-5 py-3.5">
          {/* Letterhead */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-accent-600/10 to-accent2-600/10 ring-1 ring-zinc-200 dark:ring-zinc-700">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={restaurantName}
                    onError={() => setLogoFailed(true)}
                    className="h-full w-full object-contain p-0.5"
                  />
                ) : (
                  <UtensilsCrossed
                    size={18}
                    className="text-accent-600/70 dark:text-accent-400/70"
                  />
                )}
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-extrabold tracking-widest text-slate-900 uppercase dark:text-white">
                  {restaurantName}
                </h1>
                {address && (
                  <p className="mt-0.5 text-[9px] leading-3.5 text-zinc-500 dark:text-zinc-400">
                    {displayAddress}
                  </p>
                )}
                {(phone || email) && (
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[9px] text-zinc-500 dark:text-zinc-400">
                    {phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={10} /> {phone}
                      </span>
                    )}
                    {phone && email && (
                      <span className="h-2.5 w-px bg-zinc-300 dark:bg-zinc-700" />
                    )}
                    {email && (
                      <span className="flex items-center gap-1">
                        <Mail size={10} /> {email}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[8px] font-bold tracking-[0.22em] text-accent-600 uppercase">
                Tax Invoice
              </p>
              <p className="mt-0.5 text-xs font-bold tracking-wide text-slate-900 tabular-nums dark:text-white">
                #{bill.orderNumber}
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                {created.toLocaleDateString()}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                {created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {/* Hairline */}
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-700" />

          {/* Billed to / Payment */}
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div className="space-y-0.5">
              <p className="text-[9px] font-semibold tracking-[0.2em] text-zinc-400 uppercase">
                Billed to
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {bill.customerName || "Walk-in guest"}
              </p>
              {bill.tableNumber && (
                <p className="text-zinc-500 dark:text-zinc-400">
                  Table {bill.tableNumber}
                </p>
              )}
            </div>

            <div className="space-y-0.5 text-right">
              <p className="text-[9px] font-semibold tracking-[0.2em] text-zinc-400 uppercase">
                Payment
              </p>
              <p
                className={`font-semibold ${
                  paid
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-orange-600 dark:text-orange-400"
                }`}
              >
                {bill.paymentStatus
                  ? bill.paymentStatus.replace(/_/g, " ")
                  : "—"}
              </p>
              <p className="text-zinc-500 dark:text-zinc-400">
                {bill.orderType === "DINE_IN" ? "Dine-in" : "Takeaway"}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mt-4">
            <div className="flex gap-3 border-b border-zinc-200 pb-1.5 text-[9px] font-semibold tracking-[0.18em] text-zinc-400 uppercase dark:border-zinc-700">
              <span className="flex-1">Item</span>
              <span className="w-8 text-right">Qty</span>
              <span className="w-16 text-right">Rate</span>
              <span className="w-20 text-right">Amt</span>
            </div>
            <div>
              {bill.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 border-b border-zinc-100 py-1.5 text-[11px] last:border-0 dark:border-zinc-800"
                >
                  <span className="min-w-0 flex-1 truncate text-slate-800 dark:text-slate-200">
                    {item.name}
                  </span>
                  <span className="w-8 text-right text-zinc-500 tabular-nums dark:text-zinc-400">
                    {item.quantity}
                  </span>
                  <span className="w-16 text-right text-zinc-500 tabular-nums dark:text-zinc-400">
                    {inr(item.unitPrice)}
                  </span>
                  <span className="w-20 text-right font-semibold text-slate-900 tabular-nums dark:text-white">
                    {inr(item.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="mt-3.5 flex justify-end">
            <div className="w-52 space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
                <span className="font-medium text-slate-900 tabular-nums dark:text-white">
                  {inr(bill.subtotal)}
                </span>
              </div>
              {showTax && (
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    GST ({gstRate}%{inclusive ? " inc." : ""})
                  </span>
                  <span className="font-medium text-slate-900 tabular-nums dark:text-white">
                    {inr(bill.taxAmount)}
                  </span>
                </div>
              )}
              <div className="rounded-lg bg-slate-900 px-3 py-1.5">
                <div className="flex items-center justify-between text-white">
                  <span className="text-[10px] font-semibold tracking-[0.16em] uppercase">
                    Total
                  </span>
                  <span className="text-xs font-bold tabular-nums">
                    {inr(bill.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex flex-col items-center text-center">
            <p className="text-xs font-bold tracking-wide text-slate-900 dark:text-white">
              Thank you for dining with us!
            </p>
            <span className="mt-1.5 h-px w-24 bg-zinc-200 dark:bg-zinc-800" />
            <p className="mt-1.5 text-[9px] font-bold tracking-widest text-accent-600 dark:text-accent-400">
              AharQR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * View Bill modal — renders the bill as a native web preview with three
 * client-side actions: Print, Download and Share on WhatsApp. The PDF is only
 * generated on demand (for those actions). No backend/API.
 */
export function BillModal({ open, onClose, bill, phone }: BillModalProps) {
  const [busy, setBusy] = useState<"print" | "download" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const blobRef = useRef<Blob | null>(null);

  // Bills handed in by order cards usually only carry the order details; look
  // up the signed-in staff member's restaurant for the letterhead when needed.
  const isStaff = useAuthStore((s) => Boolean(s.user));
  const needsRestaurant = isStaff && !bill.restaurant?.name;
  const { data: profile } = useMyRestaurant({ enabled: needsRestaurant });

  const restaurant = bill.restaurant?.name
    ? bill.restaurant
    : profile
      ? {
          name: profile.name,
          logo: profile.logo,
          address: formatRestaurantAddress(profile) || null,
          addressParts: {
            premisesName: profile.premisesName,
            street: profile.street,
            locality: profile.locality,
            villageWard: profile.villageWard,
            blockMunicipality: profile.blockMunicipality,
            townCity: profile.townCity,
            district: profile.district,
            state: profile.state,
            postalCode: profile.postalCode,
          },
          phone: profile.phone,
          email: profile.email,
        }
      : undefined;

  const resolvedBill: BillData = { ...bill, restaurant };

  const cacheKey = `${open}:${resolvedBill.orderNumber}:${resolvedBill.createdAt}`;
  const [prevKey, setPrevKey] = useState(cacheKey);

  // Reset when a different bill is opened (render-phase reset, no effect churn).
  if (prevKey !== cacheKey) {
    setPrevKey(cacheKey);
    setError(null);
    setShareOpen(false);
  }

  // Drop the cached PDF blob when switching bills.
  useEffect(() => {
    blobRef.current = null;
  }, [cacheKey]);

  // Fetch remote logos as data URLs first (Cloudinary etc.) so @react-pdf can
  // embed them into the PDF; retry without the logo if it can't be fetched.
  const generate = useCallback(async (): Promise<Blob> => {
    try {
      const logo = resolvedBill.restaurant?.logo
        ? await logoToDataUrl(resolvedBill.restaurant.logo)
        : null;
      return await generateBillBlob({
        ...resolvedBill,
        restaurant: { ...resolvedBill.restaurant, logo },
      });
    } catch (err) {
      if (resolvedBill.restaurant?.logo) {
        return generateBillBlob({
          ...resolvedBill,
          restaurant: { ...resolvedBill.restaurant, logo: null },
        });
      }
      throw err;
    }
  }, [resolvedBill]);

  async function getBlob(): Promise<Blob> {
    if (!blobRef.current) blobRef.current = await generate();
    return blobRef.current;
  }

  const disabled = busy !== null || shareOpen;

  function handlePrint() {
    if (busy) return;
    setBusy("print");
    setError(null);
    getBlob()
      .then(printBillBlob)
      .catch(() => setError("Could not generate the bill PDF."))
      .finally(() => setBusy(null));
  }

  function handleDownload() {
    if (busy) return;
    setBusy("download");
    setError(null);
    getBlob()
      .then((blob) => downloadBillBlob(blob, billFileName(resolvedBill)))
      .catch(() => setError("Could not generate the bill PDF."))
      .finally(() => setBusy(null));
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        closeOnEscape={!shareOpen}
        size="lg"
        icon={<Receipt size={18} />}
        title={`Bill · #${resolvedBill.orderNumber}`}
        description="Review the bill, then print, download or share it on WhatsApp."
        footer={
          <div className="grid w-full grid-cols-3 gap-2">
            <Button
              variant="secondary"
              size="sm"
              loading={busy === "print"}
              loadingText="Preparing…"
              onClick={handlePrint}
              disabled={disabled}
            >
              <Printer size={14} /> Print
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={busy === "download"}
              loadingText="Generating…"
              onClick={handleDownload}
              disabled={disabled}
            >
              <Download size={14} /> Download
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setError(null);
                setShareOpen(true);
              }}
              disabled={disabled}
            >
              <MessageCircle size={14} /> Share
            </Button>
          </div>
        }
      >
        {error && (
          <div className="mb-3">
            <ErrorBanner message={error} />
          </div>
        )}

        <div className="pb-2">
          <BillView bill={resolvedBill} />
        </div>
      </Modal>

      <ShareBillWhatsAppModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        bill={resolvedBill}
        phone={phone}
        getBlob={getBlob}
      />
    </>
  );
}

interface ShareBillWhatsAppModalProps {
  open: boolean;
  onClose: () => void;
  bill: BillData;
  phone?: string | null;
  getBlob: () => Promise<Blob>;
}

function ShareBillWhatsAppModal({
  open,
  onClose,
  bill,
  phone,
  getBlob,
}: ShareBillWhatsAppModalProps) {
  const [number, setNumber] = useState(phone ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `${open}:${bill.orderNumber}:${bill.createdAt}:${phone ?? ""}`;
  const [prevKey, setPrevKey] = useState(cacheKey);
  if (prevKey !== cacheKey) {
    setPrevKey(cacheKey);
    setNumber(phone ?? "");
    setError(null);
    setBusy(false);
  }

  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function";

  async function handleShare() {
    const digits = number.replace(/\D/g, "");
    if (digits.length < 8) {
      setError("Enter a valid number, including the country code.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const blob = await getBlob();
      const file = new File([blob], billFileName(bill), {
        type: "application/pdf",
      });
      const text = `Bill for order #${bill.orderNumber} — Total ${inr(bill.totalAmount)}`;

      if (canShareFiles && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Bill ${bill.orderNumber}`,
            text,
          });
          onClose();
          return;
        } catch (e) {
          if (e instanceof DOMException && e.name === "AbortError") return;
        }
      }

      downloadBillBlob(blob, billFileName(bill));
      window.open(
        `https://wa.me/${digits}?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener,noreferrer",
      );
      onClose();
    } catch {
      setError("Could not prepare the bill PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      size="sm"
      icon={<MessageCircle size={18} />}
      title="Share bill on WhatsApp"
      description="Enter the customer's WhatsApp number, then send the bill PDF."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={handleShare}
            loading={busy}
            loadingText="Preparing…"
          >
            <Send size={14} /> Send bill
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          id="billWaPhone"
          label="WhatsApp number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          autoFocus
          placeholder="+91 98765 43210"
          value={number}
          error={error ?? undefined}
          onChange={(e) => {
            setNumber(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleShare();
          }}
        />

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
            Bill #{bill.orderNumber} · {inr(bill.totalAmount)}
          </p>
          <p className="mt-1 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">
            {canShareFiles
              ? "Your device share sheet opens so you can pick WhatsApp with the PDF already attached."
              : "The PDF downloads and WhatsApp opens with the bill details — attach the downloaded file in the chat."}
          </p>
        </div>
      </div>
    </Modal>
  );
}

/** Small reusable trigger that opens the View Bill modal. */
export function BillButton({
  bill,
  phone,
  size = "sm",
  iconOnly = false,
  label = "Bill",
  className = "",
  menuItem = false,
}: {
  bill: BillData;
  phone?: string | null;
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  label?: string;
  className?: string;
  /** Render as a row inside a kebab/ActionMenu instead of a standalone button. */
  menuItem?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {menuItem ? (
        <ActionMenuItem
          icon={<Receipt size={14} />}
          label={label}
          onClick={() => setOpen(true)}
        />
      ) : (
        <Button
          size={size}
          variant="secondary"
          onClick={() => setOpen(true)}
          title={iconOnly ? "View Bill" : undefined}
          className={className}
        >
          <Receipt size={13} />
          {!iconOnly && <span>{label}</span>}
        </Button>
      )}
      <BillModal
        open={open}
        onClose={() => setOpen(false)}
        bill={bill}
        phone={phone}
      />
    </>
  );
}
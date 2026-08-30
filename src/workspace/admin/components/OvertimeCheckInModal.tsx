import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Zap } from "lucide-react";
import { Modal, Button, Badge } from "../../../common/ui";
import { QrCodeBox } from "./QrCodeBox";
import { useQrToken } from "./useQrToken";
import { getOvertimeCheckInQr } from "../../../services/overtime.services";
import {
  fetchOvertime,
  cancelOvertime,
  type OvertimeRecord,
} from "../../../api/overtimeApi";
import toast from "react-hot-toast";

const EDITABLE_STATUSES = ["PENDING", "APPROVED"];

function formatPlanned(value?: string | null): string {
  if (!value) return "—";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt
    .toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const tone =
    status === "PENDING" || status === "APPROVED"
      ? "amber"
      : status === "COMPLETED"
        ? "green"
        : status === "CANCELLED" || status === "REJECTED"
          ? "red"
          : "indigo";
  return <Badge tone={tone}>{status}</Badge>;
}

/** Admin shows the check-in QR for one staff member's overtime record. */
export function OvertimeCheckInModal({
  open,
  onClose,
  defaultOvertimeId,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  defaultOvertimeId?: string;
  onEdit?: (record: OvertimeRecord) => void;
}) {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["overtime", "PENDING_APPROVAL"],
    queryFn: () => fetchOvertime(),
    enabled: open,
  });
  const records = data?.records ?? [];
  const selected =
    records.find((r) => r.id === defaultOvertimeId) ?? records[0] ?? null;
  const effectiveId = selected?.id ?? "";
  const editable = selected
    ? EDITABLE_STATUSES.includes(selected.status)
    : false;

  const { url, loading, generate } = useQrToken(async () => {
    try {
      const res = await getOvertimeCheckInQr(effectiveId || undefined);
      const token = res?.token;
      if (!token) throw new Error("no token");
      return token;
    } catch {
      toast.error("Could not generate overtime check-in QR");
      return undefined;
    }
  });

  useEffect(() => {
    if (open && effectiveId) void generate();
  }, [open, effectiveId, generate]);

  const cancelMutation = useMutation({
    mutationFn: () => cancelOvertime(effectiveId),
    onSuccess: () => {
      toast.success("Overtime cancelled");
      qc.invalidateQueries({ queryKey: ["overtime"] });
      if (selected?.staffId) {
        qc.invalidateQueries({
          queryKey: ["staff-attendance-status", selected.staffId],
        });
      }
    },
    onError: () => toast.error("Could not cancel overtime"),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Zap size={18} />}
      title="Overtime Check-in QR"
      description="Show this QR so staff can check into overtime."
    >
      <div className="space-y-4">
        {selected && (
          <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {selected.staffName ?? "Staff member"}
              </span>
              <StatusBadge status={selected.status} />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {selected.overtimeDate ?? "—"} ·{" "}
              {formatPlanned(selected.plannedStartTime)} –{" "}
              {formatPlanned(selected.plannedEndTime)}
            </p>
            {selected.remarks ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {selected.remarks}
              </p>
            ) : null}
          </div>
        )}

        <QrCodeBox url={url} loading={loading} onRefresh={() => void generate()} />

        {editable && selected ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                onClose();
                onEdit?.(selected);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              Cancel Overtime
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
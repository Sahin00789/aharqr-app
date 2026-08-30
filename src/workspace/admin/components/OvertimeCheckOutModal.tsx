import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TimerOff } from "lucide-react";
import { Modal, Field, Select } from "../../../common/ui";
import { QrCodeBox } from "./QrCodeBox";
import { useQrToken } from "./useQrToken";
import { getOvertimeCheckOutQr } from "../../../services/overtime.services";
import { fetchOvertime } from "../../../api/overtimeApi";
import toast from "react-hot-toast";

/** Admin displays an overtime check-out QR for a selected overtime record. */
export function OvertimeCheckOutModal({
  open,
  onClose,
  defaultOvertimeId,
}: {
  open: boolean;
  onClose: () => void;
  defaultOvertimeId?: string;
}) {
  const [overtimeId, setOvertimeId] = useState<string>("");

  const { data } = useQuery({
    queryKey: ["overtime-checkout"],
    queryFn: () => fetchOvertime(),
    enabled: open,
  });
  const records = data?.records ?? [];
  const effectiveId =
    overtimeId ||
    (defaultOvertimeId && records.some((r) => r.id === defaultOvertimeId)
      ? defaultOvertimeId
      : records[0]?.id) ||
    "";

  const { url, loading, generate } = useQrToken(async () => {
    try {
      const res = await getOvertimeCheckOutQr(effectiveId || undefined);
      const token = res?.token;
      if (!token) throw new Error("no token");
      return token;
    } catch {
      toast.error("Could not generate overtime check-out QR");
      return undefined;
    }
  });

  useEffect(() => {
    if (open && effectiveId) void generate();
  }, [open, effectiveId, generate]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<TimerOff size={18} />}
      title="Overtime Check-out QR"
      description="Show this QR so staff can check out of overtime."
    >
      <div className="space-y-4">
        <Field label="Overtime Record">
          <Select
            value={effectiveId}
            onChange={(e) => setOvertimeId(e.target.value)}
            options={records.map((r) => ({
              value: r.id,
              label: `${r.id}${r.overtimeDate ? ` · ${r.overtimeDate}` : ""}`,
            }))}
          />
        </Field>
        <QrCodeBox url={url} loading={loading} onRefresh={() => void generate()} />
      </div>
    </Modal>
  );
}

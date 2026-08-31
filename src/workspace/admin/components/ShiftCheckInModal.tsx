import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LogIn } from "lucide-react";
import { Modal, Field, Select } from "../../../common/ui";
import { QrCodeBox } from "./QrCodeBox";
import { useQrToken } from "./useQrToken";
import { generateAttendanceQr } from "../../../services/attendance.services";
import { fetchShiftTemplates } from "../../../api/shiftsApi";

export function ShiftCheckInModal({
  open,
  onClose,
  defaultShiftId,
}: {
  open: boolean;
  onClose: () => void;
  defaultShiftId?: string;
}) {
  const [shiftTemplateId, setShiftTemplateId] = useState<string>("");

  const { data: shiftsData } = useQuery({
    queryKey: ["shift-templates"],
    queryFn: fetchShiftTemplates,
    enabled: open,
  });
  const templates = shiftsData?.templates ?? [];
  const effectiveId =
    shiftTemplateId ||
    (defaultShiftId && templates.some((t) => t.id === defaultShiftId)
      ? defaultShiftId
      : templates[0]?.id) ||
    "";

  const { url, token, loading, error, generate, secondsLeft } = useQrToken(
    async () => {
      const res = await generateAttendanceQr({
        shiftTemplateId: effectiveId,
        actionType: "CHECK_IN",
        workType: "REGULAR",
      });
      const token = res?.token;
      if (!token) throw new Error("No token returned.");
      return token;
    },
    { enabled: open },
  );

  useEffect(() => {
    if (open && effectiveId) void generate();
  }, [open, effectiveId, generate]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<LogIn size={18} />}
      title="Shift Check-in QR"
      description="Show this QR so staff can check into their shift."
    >
      <div className="space-y-4">
        <Field label="Shift template">
          <Select
            value={effectiveId}
            onChange={(e) => setShiftTemplateId(e.target.value)}
            options={templates.map((t) => ({
              value: t.id,
              label: t.name,
            }))}
          />
        </Field>
        <QrCodeBox
          url={url}
          token={token}
          loading={loading}
          error={error}
          secondsLeft={secondsLeft}
          onRefresh={() => void generate()}
        />
      </div>
    </Modal>
  );
}
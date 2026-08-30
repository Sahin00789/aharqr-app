import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus } from "lucide-react";
import { Button, Input, Modal } from "../../../common/ui";
import { createWorkingShift } from "../../../api/staffApi";
import toast from "react-hot-toast";

interface WorkingShiftModalProps {
  open: boolean;
  dayOfWeek: number;
  dayName: string;
  onClose: () => void;
}

export function WorkingShiftModal({ open, dayOfWeek, dayName, onClose }: WorkingShiftModalProps) {
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createWorkingShift,
    onSuccess: () => {
      toast.success("Working shift added");
      onClose();
      qc.invalidateQueries({ queryKey: ["admin-working-shifts"] });
    },
    onError: () => toast.error("Could not add working shift"),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Add shift — ${dayName}`}
      description="Define a shift window for this day. It will apply to attendance and payroll."
      icon={<CalendarPlus size={18} />}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="working-shift-form"
            loading={createMutation.isPending}
            loadingText="Saving."
          >
            Save shift
          </Button>
        </>
      }
    >
      <form
        id="working-shift-form"
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const shiftName = (form.elements.namedItem("shiftName") as HTMLInputElement).value.trim();
          const startTime = (form.elements.namedItem("startTime") as HTMLInputElement).value;
          const endTime = (form.elements.namedItem("endTime") as HTMLInputElement).value;
          const isNightShift = (form.elements.namedItem("isNightShift") as HTMLInputElement).checked;
          if (!shiftName || !startTime || !endTime) {
            toast.error("Name, start and end time are required");
            return;
          }
          createMutation.mutate({ shiftName, startTime, endTime, isNightShift, dayOfWeek });
        }}
      >
        <Input label="Name" name="shiftName" placeholder="Morning" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start time" name="startTime" type="time" />
          <Input label="End time" name="endTime" type="time" />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="isNightShift"
            className="h-4 w-4 rounded border-zinc-300 text-accent-600 focus:ring-accent-500"
          />
          Night shift
        </label>
      </form>
    </Modal>
  );
}
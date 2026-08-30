import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Moon } from "lucide-react";
import { EmptyState, useCurrentUser, Button, Card, Badge } from "../../../common/ui";
import { SecondaryScreenAdapter } from "../../../common/layouts/SecondaryScreenAdapter";
import {
  fetchWorkingShiftsWeek,
  deleteWorkingShift,
  type WeeklyDay,
} from "../../../api/staffApi";
import { WorkingShiftModal } from "../components/WorkingShiftModal";
import toast from "react-hot-toast";

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Restaurant working shifts — a 7-day weekly view where each day owns its
 * shift windows (used for attendance and payroll).
 */
export function AdminWorkingShiftsTab() {
  useCurrentUser();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-working-shifts"],
    queryFn: () => fetchWorkingShiftsWeek().then((d) => d.days as WeeklyDay[]),
  });
  const days: WeeklyDay[] = data ?? [];
  const totalShifts = days.reduce((sum, d) => sum + d.shifts.length, 0);

  const [addingDay, setAddingDay] = useState<number | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-working-shifts"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkingShift(id),
    onSuccess: () => {
      toast.success("Working shift removed");
      invalidate();
    },
    onError: () => toast.error("Could not remove working shift"),
  });

  const selectedDay = addingDay !== null ? days[addingDay - 1] ?? { dayOfWeek: addingDay, dayName: DAY_LABELS[addingDay - 1] } : null;

  return (
    <SecondaryScreenAdapter
      title="Working shifts"
      subtitle="Weekly shift windows per day — the floor schedule used for attendance and payroll"
    >
      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading…</p>
      ) : isError ? (
        <EmptyState title="Couldn't load shifts" description="Try again shortly." />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="indigo">{days.length} days</Badge>
            <Badge tone="zinc">{totalShifts} shifts</Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {days.map((day) => (
              <Card key={day.dayOfWeek} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {day.dayName} <span className="font-normal text-zinc-400">· Day {day.dayOfWeek}</span>
                    </p>
                    <p className="text-xs text-zinc-400">
                      {day.shifts.length === 0 ? "No shifts" : `${day.shifts.length} shift${day.shifts.length === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAddingDay(day.dayOfWeek)}
                  >
                    <Plus size={14} /> Add shift
                  </Button>
                </div>

                {day.shifts.length > 0 ? (
                  <ul className="space-y-2">
                    {day.shifts.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg border border-zinc-100 px-3 py-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-zinc-800">{s.name}</p>
                            {s.isNightShift && (
                              <Badge tone="indigo">
                                <Moon size={10} /> Night
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400">
                            {s.startTime}–{s.endTime}
                            {s.operatingHours ? ` (${s.operatingHours})` : ""}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(s.id)}
                          loading={deleteMutation.isPending}
                          title="Remove shift"
                        >
                          <X size={14} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-xs text-zinc-400">
                    No shift windows defined. Add one for this day.
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedDay && (
        <WorkingShiftModal
          open={addingDay !== null}
          dayOfWeek={selectedDay.dayOfWeek}
          dayName={selectedDay.dayName}
          onClose={() => setAddingDay(null)}
        />
      )}
    </SecondaryScreenAdapter>
  );
}
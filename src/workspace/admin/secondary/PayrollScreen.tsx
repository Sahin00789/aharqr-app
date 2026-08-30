import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Check, Send } from "lucide-react";
import {
  Button,
  Card,
  Input,
  Badge,
  Modal,
  EmptyState,
  SectionTitle,
  useCurrentUser,
} from "../../../common/ui";
import { SecondaryScreenAdapter } from "../../../common/layouts/SecondaryScreenAdapter";
import {
  approvePayroll,
  fetchPayroll,
  generatePayroll,
  payPayroll,
  type Payroll,
} from "../../../api/payrollApi";
import toast from "react-hot-toast";

function formatINR(n: number): string {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

function statusTone(status: string) {
  switch (status) {
    case "APPROVED":
      return "green" as const;
    case "PAID":
      return "indigo" as const;
    case "DRAFT":
      return "amber" as const;
    default:
      return "zinc" as const;
  }
}

export function AdminPayrollTab() {
  useCurrentUser();
  const qc = useQueryClient();
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));

  const [paying, setPaying] = useState<Payroll | null>(null);
  const [method, setMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER">(
    "CASH",
  );
  const [amount, setAmount] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-payroll", year, month],
    queryFn: () => fetchPayroll(Number(year), Number(month)),
  });
  const payrolls: Payroll[] = data?.payrolls ?? [];

  const generateMutation = useMutation({
    mutationFn: () => generatePayroll({ year: Number(year), month: Number(month) }),
    onSuccess: (res) => {
      toast.success(`Generated ${res.generated} payroll entries`);
      qc.invalidateQueries({ queryKey: ["admin-payroll"] });
    },
    onError: () => toast.error("Could not generate payroll"),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approvePayroll(id),
    onSuccess: () => {
      toast.success("Payroll approved");
      qc.invalidateQueries({ queryKey: ["admin-payroll"] });
    },
    onError: () => toast.error("Could not approve"),
  });

  const payMutation = useMutation({
    mutationFn: () =>
      payPayroll(paying!.id, {
        method,
        amount: Number(amount),
      }),
    onSuccess: () => {
      toast.success("Payment recorded");
      setPaying(null);
      qc.invalidateQueries({ queryKey: ["admin-payroll"] });
    },
    onError: () => toast.error("Could not record payment"),
  });

  return (
    <SecondaryScreenAdapter
      title="Payroll"
      action={
        <Button size="sm" onClick={() => generateMutation.mutate()}>
          <Plus size={14} /> Generate payroll
        </Button>
      }
    >
      <Card className="grid gap-3 sm:grid-cols-4">
        <Input
          label="Year"
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <Input
          label="Month (1-12)"
          type="number"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <div className="flex items-end">
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              qc.invalidateQueries({ queryKey: ["admin-payroll"] })
            }
            className="w-full"
          >
            View
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading payroll…</p>
      ) : isError ? (
        <EmptyState
          title="Couldn't load payroll"
          description="Check your connection and try again."
        />
      ) : payrolls.length === 0 ? (
        <EmptyState
          title="No payroll entries"
          description="Generate payroll for the selected month to see staff salary snapshots."
        />
      ) : (
        <section className="space-y-3">
          <SectionTitle>Payroll</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {payrolls.map((p) => (
              <Card key={p.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900">
                    {p.staffName}
                  </p>
                  <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                </div>
                <p className="text-xs text-zinc-400">
                  {p.month}/{p.year}
                </p>
                <div className="space-y-0.5 text-xs text-zinc-600">
                  <p className="flex justify-between">
                    <span>Gross</span>
                    <span>{formatINR(p.grossSalary)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Deduction</span>
                    <span>{formatINR(p.deductionAmount)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Overtime</span>
                    <span>{formatINR(p.totalOvertimeAmount)}</span>
                  </p>
                  <p className="flex justify-between font-semibold text-zinc-900">
                    <span>Net</span>
                    <span>{formatINR(p.netSalary)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 border-t border-zinc-100 pt-2">
                  {p.status === "DRAFT" && (
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(p.id)}
                      loading={approveMutation.isPending}
                    >
                      <Check size={14} /> Approve
                    </Button>
                  )}
                  {(p.status === "APPROVED" || p.status === "DRAFT") && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setPaying(p);
                        setAmount(String(p.netSalary));
                      }}
                    >
                      <Send size={14} /> Pay
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <Modal
        open={paying !== null}
        onClose={() => setPaying(null)}
        title="Record payment"
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setPaying(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              form="pay-form"
              type="submit"
              loading={payMutation.isPending}
            >
              Record payment
            </Button>
          </>
        }
      >
        {paying && (
          <form
            id="pay-form"
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!amount || Number(amount) <= 0) {
                toast.error("Enter a valid amount");
                return;
              }
              payMutation.mutate();
            }}
          >
            <label className="space-y-1">
              <span className="text-xs font-medium uppercase text-zinc-600">
                Method
              </span>
              <select
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value as "CASH" | "UPI" | "BANK_TRANSFER")
                }
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
              </select>
            </label>
            <Input
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </form>
        )}
      </Modal>
    </SecondaryScreenAdapter>
  );
}

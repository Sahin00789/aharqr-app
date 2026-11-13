import { PaymentReport } from "../../../common/pages/screensfordashboard/PaymentReport";
import { OrderTrailButton } from "../../admin/components/OrderTrailModal";

/**
 * Captain payments screen — the same shared payment report the admin finance
 * tab uses (month rail, KPIs, day rail, payments) so both roles see one
 * consistent money view.
 */
export function CaptainPaymentsTab() {
  return (
    <PaymentReport
      renderTrail={(order) => (
        <OrderTrailButton order={order} iconOnly className="!px-2" />
      )}
    />
  );
}

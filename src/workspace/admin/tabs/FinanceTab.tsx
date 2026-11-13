import { PaymentReport } from "../../../common/pages/screensfordashboard/PaymentReport";
import { OrderTrailButton } from "../components/OrderTrailModal";

/**
 * Admin finance report — the shared payment report (month rail, KPIs, day rail
 * and payment rows) with the admin order-trail trigger on every payment.
 */
export function AdminFinanceTab() {
  return (
    <PaymentReport
      renderTrail={(order) => (
        <OrderTrailButton order={order} iconOnly className="!px-2" />
      )}
    />
  );
}

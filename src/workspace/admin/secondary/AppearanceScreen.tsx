import { AppearancePicker } from "../../../common/appearance/AppearancePicker";
import { SecondaryScreenAdapter } from "../../../common/layouts/SecondaryScreenAdapter";

export function AppearanceScreen() {
  return (
    <SecondaryScreenAdapter title="Appearance">
      <AppearancePicker />
    </SecondaryScreenAdapter>
  );
}

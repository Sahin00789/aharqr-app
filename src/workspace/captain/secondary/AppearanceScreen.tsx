import { AppearancePicker } from "../../../common/appearance/AppearancePicker";
import { SecondaryScreen } from "../../../common/layouts/SecondaryScreen";

export function AppearanceScreen() {
  return (
    <SecondaryScreen title="Appearance">
      <AppearancePicker />
    </SecondaryScreen>
  );
}

import type { ReactNode } from "react";
import { SecondaryScreen } from "./SecondaryScreen";

/**
 * Adapts a settings page into a full-screen SecondaryScreen overlay so it
 * reads as a dedicated screen covering the dashboard, not an inline panel.
 */
export function SecondaryScreenAdapter({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SecondaryScreen title={title} subtitle={subtitle} action={action}>
      {children}
    </SecondaryScreen>
  );
}

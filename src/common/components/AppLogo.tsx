/**
 * AharQR brand mark — the single source of truth for app branding.
 *
 * Assets live in `web/public`:
 *   - `aharqr-logo-tight.png` — transparent padding trimmed, used in UI chrome
 *   - `aharqr-logo.png`       — full artwork (favicon / print source)
 *
 * The artwork is dark navy on a transparent background and is roughly 2.4:1
 * wide (mark + wordmark), so it must be sized by height with
 * `w-auto object-contain` and must never be cropped into a square container.
 * On dark surfaces wrap it in a light plate (Tailwind `dark:` classes at the
 * call site) so the navy artwork stays legible.
 */
export function AppLogo({
  className = "h-9",
  alt = "AharQR",
}: {
  /** Height + surface treatments (e.g. `h-10 dark:rounded-xl dark:bg-white/95 dark:px-2`). */
  className?: string;
  /** Pass `""` when the logo is decorative and a text label sits next to it. */
  alt?: string;
}) {
  return (
    <img
      src="/aharqr-logo-tight.png"
      alt={alt}
      width={512}
      height={212}
      draggable={false}
      className={`w-auto shrink-0 select-none object-contain ${className}`}
    />
  );
}

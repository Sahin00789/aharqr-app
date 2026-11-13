/* eslint-disable react-refresh/only-export-components -- chart module intentionally exports the formatINR helper next to its chart components. */
import type { ReactNode } from "react";

/* ---------------------------------------------------------------
 * Lightweight, dependency-free SVG+div chart primitives.
 * They read the runtime sub-theme via CSS variables (--accent-* /
 * --accent2-*), so they follow the role theme + dark mode automatically.
 * ---------------------------------------------------------------- */

export function formatINR(n: number): string {
  return `₹${Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

/** Coerce a chart metric to a safe finite number (nullish/NaN become 0). */
function chartValue(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const ACCENT = "var(--accent-600)";
const ACCENT2 = "var(--accent2-600)";

/** Vertical bar chart (div-based). `value` drives height, `sub` an optional
 *  secondary number shown beside the label. Highlights the last bar. */
export function VerticalBars({
  items,
  height = 180,
  color = ACCENT,
  valueFormatter = (n) => formatINR(n),
  labelFormatter = (label) => label,
  maxLabelEvery = 1,
}: {
  items: Array<{ key: string; label: string; value: number; sub?: number }>;
  height?: number;
  color?: string;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
  maxLabelEvery?: number;
}) {
  const max = Math.max(1, ...items.map((i) => chartValue(i.value)));
  return (
    <div>
      <div
        className="flex w-full items-end justify-between gap-1"
        style={{ height }}
      >
        {items.map((item, idx) => {
          const h = Math.max(2, (chartValue(item.value) / max) * 100);
          const isLast = idx === items.length - 1;
          return (
            <div
              key={item.key}
              className="group relative flex h-full flex-1 flex-col justify-end"
              title={`${labelFormatter(item.label)} · ${valueFormatter(item.value)}`}
            >
              <div
                className={`mx-auto w-full max-w-7 rounded-t-sm transition-opacity hover:opacity-80 ${
                  isLast ? "opacity-90" : "opacity-55"
                }`}
                style={{
                  height: `${h}%`,
                  background: isLast ? ACCENT2 : color,
                }}
              />
              {isLast && (
                <span className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full rounded bg-zinc-900 px-1 py-0.5 text-[10px] font-medium whitespace-nowrap text-white dark:bg-zinc-100 dark:text-zinc-900">
                  {valueFormatter(item.value)}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex w-full justify-between gap-1">
        {items.map((item, idx) => {
          const show =
            items.length <= 7 ||
            idx % maxLabelEvery === 0 ||
            idx === items.length - 1;
          const isLast = idx === items.length - 1;
          return (
            <div
              key={item.key}
              className="min-w-0 flex-1 text-center text-[10px] leading-tight text-zinc-400"
            >
              {show ? (
                <span className={isLast ? "font-semibold" : ""}>
                  {labelFormatter(item.label)}
                </span>
              ) : (
                "·"
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface StackSegment {
  name: string;
  color: string;
  values: number[];
}

/** Stacked daily columns (e.g. orders by channel per day). */
export function StackedBars({
  labels,
  segments,
  height = 180,
  showTotal = true,
}: {
  labels: string[];
  segments: StackSegment[];
  height?: number;
  showTotal?: boolean;
}) {
  const dayMax = labels.map((_, idx) =>
    Math.max(1, segments.reduce((sum, s) => sum + (s.values[idx] ?? 0), 0)),
  );
  const max = Math.max(...dayMax);

  return (
    <div>
      <div className="flex w-full items-end justify-between gap-1" style={{ height }}>
        {labels.map((label, idx) => {
          const total = dayMax[idx];
          return (
            <div
              key={`${label}-${idx}`}
              className="group relative flex h-full flex-1 flex-col justify-end"
              title={segments
                .filter((s) => (s.values[idx] ?? 0) > 0)
                .map((s) => `${s.name}: ${s.values[idx]}`)
                .join(" · ")}
            >
              <div
                className="flex w-full max-w-8 flex-col-reverse justify-start overflow-hidden rounded-t-sm"
                style={{ height: `${(total / max) * 100}%` }}
              >
                {segments.map((s) => (
                  <div
                    key={s.name}
                    className="w-full"
                    style={{
                      height: `${(s.values[idx] ?? 0) >= 0 ? (s.values[idx] / total) * 100 : 0}%`,
                      background: s.color,
                    }}
                  />
                ))}
              </div>
              {showTotal && total > 0 && (
                <span className="pointer-events-none absolute top-0 left-1/2 hidden -translate-x-1/2 -translate-y-full rounded bg-zinc-900 px-1 py-0.5 text-[10px] font-medium text-white group-hover:block dark:bg-zinc-100 dark:text-zinc-900">
                  {total}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex w-full justify-between gap-1">
        {labels.map((label) => (
          <div
            key={label}
            className={`min-w-0 flex-1 truncate text-center text-[10px] leading-tight text-zinc-400`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Donut chart with an HTML center label + legend below. */
export function DonutChart({
  segments,
  size = 148,
  thickness = 22,
  centerLabel,
  centerValue,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-zinc-200, #e4e4e7)"
            strokeWidth={thickness}
          />
          {total > 0 &&
            segments.map((seg) => {
              const len = (seg.value / total) * circumference;
              const dash = `${len} ${circumference - len}`;
              const el = (
                <circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={thickness}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                />
              );
              offset += len;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerValue && (
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
              {centerLabel}
            </span>
          )}
        </div>
      </div>
      <ul className="space-y-1.5">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: seg.color }}
            />
            <span className="text-zinc-600 dark:text-zinc-300">{seg.label}</span>
            <span className="ml-auto pl-4 font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
              {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A single horizontal-progress row. */
export interface BarRow {
  key: string;
  label: string;
  value: number;
  color?: string;
}

/** Horizontal proportional bars with label + value (order sources, channels). */
export function RowBars({
  rows,
  subtitle,
  getValue,
  format,
}: {
  rows: BarRow[];
  subtitle?: (row: BarRow) => ReactNode;
  getValue?: (row: BarRow) => number;
  format?: (value: number) => string;
}) {
  const rowValue = (row: BarRow): number =>
    chartValue(getValue ? getValue(row) : row.value);
  const getSub = subtitle ?? (() => undefined);
  const fmt = format ?? ((n: number) => String(n));
  const max = Math.max(1, ...rows.map((r) => rowValue(r)));
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const pct = (rowValue(row) / max) * 100;
        return (
          <div key={row.key} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-zinc-700 dark:text-zinc-200">
                {row.label}
              </span>
              <span className="flex items-baseline gap-2">
                {getSub(row)}
                <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                  {fmt(rowValue(row))}
                </span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${pct}%`,
                  background: row.color ?? ACCENT,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Chart legend row used by stacked/vertical charts. */
export function ChartLegend({
  items,
}: {
  items: Array<{ label: string; color: string }>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
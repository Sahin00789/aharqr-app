import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepperProps {
  steps: string[];
  /** Zero-based index of the active step. */
  current: number;
}

/** Animated horizontal step indicator with progress line and checkmarks. */
export function Stepper({ steps, current }: StepperProps) {
  const progress = steps.length > 1 ? current / (steps.length - 1) : 0;

  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.span
                initial={false}
                animate={{ scale: active ? 1.1 : 1 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                  done
                    ? "border-accent-600 bg-accent-600 text-white"
                    : active
                      ? "border-accent-600 bg-white text-accent-600 dark:bg-zinc-900"
                      : "border-zinc-300 bg-white text-zinc-400 dark:bg-zinc-900"
                }`}
              >
                {done ? <Check size={16} /> : i + 1}
              </motion.span>
              <span
                className={`whitespace-nowrap text-[11px] font-medium ${
                  active || done
                    ? "text-zinc-700 dark:text-zinc-200"
                    : "text-zinc-400"
                }`}
              >
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div className="relative mx-2 -mt-5 h-0.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <motion.div
                  initial={false}
                  animate={{ scaleX: i < current ? 1 : 0 }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="h-full bg-accent-600"
                />
              </div>
            )}
          </div>
        );
      })}
      {/* keep `progress` available for callers wanting a global bar, if needed */}
      <span className="sr-only">{Math.round(progress * 100)}% complete</span>
    </div>
  );
}

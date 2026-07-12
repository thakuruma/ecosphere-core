import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  unit,
  delta,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  icon: LucideIcon;
  tone?: "primary" | "env" | "social" | "governance";
}) {
  const toneClass = {
    primary: "text-primary bg-primary/10 ring-primary/25",
    env: "text-env bg-env/10 ring-env/25",
    social: "text-social bg-social/10 ring-social/25",
    governance: "text-governance bg-governance/10 ring-governance/25",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-semibold tracking-tight">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {delta && (
            <div className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-primary">{delta}</span> vs last period
            </div>
          )}
        </div>
        <div className={cn("grid h-10 w-10 place-items-center rounded-lg ring-1", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
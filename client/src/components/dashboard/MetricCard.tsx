import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";

export interface MetricCardProps {
  label: string;
  value: number | string;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  /** semantic color name from tokens */
  tone: "primary" | "success" | "ai" | "warning";
  loading?: boolean;
}

const TONES: Record<MetricCardProps["tone"], { iconBg: string; iconText: string }> = {
  primary: { iconBg: "bg-primary-soft", iconText: "text-primary" },
  success: { iconBg: "bg-success-soft", iconText: "text-success" },
  ai: { iconBg: "bg-ai-soft", iconText: "text-ai" },
  warning: { iconBg: "bg-warning-soft", iconText: "text-warning" },
};

export function MetricCard({ label, value, delta, deltaLabel, icon: Icon, tone, loading }: MetricCardProps) {
  const t = TONES[tone];

  if (loading) {
    return (
      <Card className="p-5 shadow-card">
        <div className="flex items-start justify-between">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="mt-4 h-4 w-24" />
        <Skeleton className="mt-2 h-8 w-16" />
      </Card>
    );
  }

  const deltaIsPositive = (delta ?? 0) >= 0;
  return (
    <Card className="p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", t.iconBg)}>
          <Icon className={cn("h-6 w-6", t.iconText)} />
        </div>
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold",
              deltaIsPositive ? "text-success" : "text-danger",
            )}
          >
            {deltaIsPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {deltaIsPositive ? "+" : ""}
            {delta}
            {deltaLabel ?? ""}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
    </Card>
  );
}

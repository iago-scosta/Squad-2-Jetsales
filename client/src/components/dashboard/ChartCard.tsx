import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { VolumePoint } from "@/types/domain";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle } from "lucide-react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: VolumePoint[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  variant: "line" | "bar";
  colorVar: string; // CSS HSL var name e.g. 'var(--primary)'
}

function formatDay(day: string): string {
  try {
    return format(parseISO(day), "dd/MM", { locale: ptBR });
  } catch {
    return day;
  }
}

export function ChartCard({ title, subtitle, data, isLoading, isError, onRetry, variant, colorVar }: ChartCardProps) {
  return (
    <Card className="p-5 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {isLoading && <Skeleton className="h-[240px] w-full" />}

      {!isLoading && isError && (
        <div className="flex h-[240px] flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Não foi possível carregar os dados.</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {variant === "line" ? (
              <LineChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelFormatter={(l) => formatDay(String(l))}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={`hsl(${colorVar})`}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: `hsl(${colorVar})` }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelFormatter={(l) => formatDay(String(l))}
                />
                <Bar dataKey="count" fill={`hsl(${colorVar})`} radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
          Nenhum dado no período.
        </div>
      )}
    </Card>
  );
}

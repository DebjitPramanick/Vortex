import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { chartColor } from "@services";
import "./bar.css";

export type BarChartDatum = Record<string, string | number | null | undefined>;

export type VxBarChartProps = {
  data: BarChartDatum[];
  nameKey?: string;
  dataKey?: string;
  isAnimationActive?: boolean;
};

type BarTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{
    value?: number;
    payload?: BarChartDatum;
  }>;
  nameKey: string;
};

function BarTooltip({ active, payload, nameKey }: BarTooltipProps) {
  const point = payload?.[0];
  if (!active || !point) return null;
  const label = String(point.payload?.[nameKey] ?? "");

  return (
    <div className="vx-bar-tooltip">
      <p className="vx-bar-tooltip-name">{label}</p>
      <p className="vx-bar-tooltip-value">
        {Number(point.value ?? 0).toLocaleString()} applications
      </p>
    </div>
  );
}

export default function VxBarChart({
  data,
  nameKey = "name",
  dataKey = "value",
  isAnimationActive = true,
}: VxBarChartProps) {
  if (data.length === 0) {
    return <p className="vx-bar-empty">No data to chart</p>;
  }

  const dense = data.length > 14;

  return (
    <div className="vx-bar">
      <BarChart
        data={data}
        style={{ width: "100%", height: 240 }}
        responsive
        margin={{ top: 8, right: 8, left: 0, bottom: dense ? 12 : 0 }}
      >
        <CartesianGrid
          vertical={false}
          stroke="var(--color-vortex-border)"
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey={nameKey}
          tickLine={false}
          axisLine={{ stroke: "var(--color-vortex-border)" }}
          tick={{ fill: "var(--color-vortex-muted)", fontSize: 11 }}
          interval={dense ? "preserveStartEnd" : 0}
          minTickGap={dense ? 16 : 8}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--color-vortex-muted)", fontSize: 11 }}
          width={32}
        />
        <Tooltip
          cursor={{ fill: "var(--color-vortex-primary-soft)" }}
          content={({ active, payload }) => (
            <BarTooltip
              active={active}
              payload={payload as unknown as BarTooltipProps["payload"]}
              nameKey={nameKey}
            />
          )}
        />
        <Bar
          dataKey={dataKey}
          fill={chartColor(0)}
          radius={[4, 4, 0, 0]}
          maxBarSize={36}
          isAnimationActive={isAnimationActive}
        />
      </BarChart>
    </div>
  );
}

import { useMemo, useState } from "react";
import {
  Pie,
  PieChart,
  Tooltip,
  type PieLabelRenderProps,
  type PieSectorShapeProps,
  Sector,
  useActiveTooltipDataPoints,
  useIsTooltipActive,
} from "recharts";
import { chartColor } from "@utils/charts.helper";
import "./pie.css";

const RADIAN = Math.PI / 180;
const MIN_LABEL_PERCENT = 0.07;

export type PieChartDatum = Record<string, string | number | null | undefined>;

export type VxPieChartProps = {
  data: PieChartDatum[];
  nameKey?: string;
  dataKey?: string;
  isAnimationActive?: boolean;
};

type Slice = {
  name: string;
  value: number;
  fill: string;
};

function toSlice(
  row: PieChartDatum,
  nameKey: string,
  dataKey: string,
  index: number,
): Slice | null {
  const name = String(row[nameKey] ?? "").trim() || "Unknown";
  const value = Number(row[dataKey]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { name, value, fill: chartColor(index) };
}

function renderSliceLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: PieLabelRenderProps) {
  if (
    cx == null ||
    cy == null ||
    innerRadius == null ||
    outerRadius == null ||
    (percent ?? 0) < MIN_LABEL_PERCENT
  ) {
    return null;
  }

  const radius =
    Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.52;
  const centerX = Number(cx);
  const centerY = Number(cy);
  const x = centerX + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = centerY + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
}

function SliceShape({
  activeName,
  ...props
}: PieSectorShapeProps & { activeName: string | null }) {
  const tooltipPoints = useActiveTooltipDataPoints();
  const tooltipActive = useIsTooltipActive();
  const sliceName = String(props.payload?.name ?? "");
  const tooltipName = String(
    (tooltipPoints?.[0] as Slice | undefined)?.name ?? "",
  );
  const highlighted =
    activeName ?? (tooltipActive && tooltipName ? tooltipName : null);
  const dimmed = Boolean(highlighted) && highlighted !== sliceName;

  return (
    <Sector
      {...props}
      fill={props.payload?.fill ?? props.fill}
      stroke="var(--color-vortex-surface)"
      strokeWidth={2}
      fillOpacity={dimmed ? 0.35 : 1}
      style={{ transition: "fill-opacity 160ms ease" }}
    />
  );
}

function PieTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: Slice }>;
  total: number;
}) {
  const slice = payload?.[0]?.payload;
  if (!active || !slice || total === 0) return null;
  const percent = (slice.value / total) * 100;

  return (
    <div className="vx-pie-tooltip">
      <p className="vx-pie-tooltip-name">{slice.name}</p>
      <p className="vx-pie-tooltip-value">
        {slice.value.toLocaleString()} · {percent.toFixed(1)}%
      </p>
    </div>
  );
}

export default function VxPieChart({
  data,
  nameKey = "name",
  dataKey = "value",
  isAnimationActive = false,
}: VxPieChartProps) {
  const [activeName, setActiveName] = useState<string | null>(null);

  const slices = useMemo(() => {
    const prepared: Slice[] = [];
    data.forEach((row) => {
      const slice = toSlice(row, nameKey, dataKey, prepared.length);
      if (slice) prepared.push(slice);
    });
    return prepared;
  }, [data, nameKey, dataKey]);

  const legendItems = useMemo(() => {
    return slices
      .sort((a, b) => b.value - a.value)
      .map((slice) => {
        return {
          name: slice.name,
          value: slice.value,
        };
      });
  }, [slices]);

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (slices.length === 0 || total === 0) {
    return <p className="vx-pie-empty">No data to chart</p>;
  }

  return (
    <div className="vx-pie">
      <div className="vx-pie-plot">
        <PieChart
          style={{ width: "100%", aspectRatio: 1, maxHeight: 280 }}
          responsive
        >
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius="48%"
            outerRadius="80%"
            paddingAngle={slices.length > 1 ? 1.5 : 0}
            labelLine={false}
            label={renderSliceLabel}
            isAnimationActive={isAnimationActive}
            shape={(props: PieSectorShapeProps) => (
              <SliceShape {...props} activeName={activeName} />
            )}
          />
          <Tooltip
            content={({ active, payload }) => (
              <PieTooltip
                active={active}
                payload={
                  payload as unknown as ReadonlyArray<{ payload?: Slice }>
                }
                total={total}
              />
            )}
          />
        </PieChart>
      </div>
      <ul className="vx-pie-legend" aria-label="Chart legend">
        {legendItems.map((slice, index) => {
          const percent = (slice.value / total) * 100;
          return (
            <li key={`${slice.name}-${index}`}>
              <button
                type="button"
                className="vx-pie-legend-item"
                data-active={activeName === slice.name}
                onMouseEnter={() => setActiveName(slice.name)}
                onMouseLeave={() => setActiveName(null)}
                onFocus={() => setActiveName(slice.name)}
                onBlur={() => setActiveName(null)}
              >
                <span
                  className="vx-pie-swatch"
                  style={{ background: slice.fill }}
                />
                <span className="vx-pie-legend-label" title={slice.name}>
                  {slice.name}
                </span>
                <span className="vx-pie-legend-meta">
                  {slice.value.toLocaleString()} · {percent.toFixed(0)}%
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

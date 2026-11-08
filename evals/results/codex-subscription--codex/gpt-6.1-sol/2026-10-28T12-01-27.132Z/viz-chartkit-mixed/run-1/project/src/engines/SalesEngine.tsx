import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  ChartEngineProps,
  ChartPoint,
} from "../components/VisualizationWidget";
const fmt = (v: number) => new Intl.NumberFormat("ru-RU").format(Math.round(v));
export default function SalesEngine({
  data,
  series,
  granularity,
  unit,
}: ChartEngineProps) {
  const groups = new Map<number, ChartPoint>();
  for (const point of data) {
    const date = new Date(point.time);
    let time = point.time;
    if (granularity === "Месяц") {
      time = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
    } else if (granularity === "Неделя") {
      time = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate() - ((date.getUTCDay() + 6) % 7),
      );
    }
    const previous = groups.get(time);
    groups.set(time, {
      time,
      value: (previous?.value ?? 0) + point.value,
      comparison: (previous?.comparison ?? 0) + point.comparison,
    });
  }
  const rows = [...groups.values()];
  const maxValue = Math.max(
    1,
    ...rows.flatMap((point) => [point.value, point.comparison]),
  );
  const tickStep = Math.ceil(maxValue / 4 / 10000) * 10000;
  const ticks = Array.from({ length: 5 }, (_, i) => i * tickStep);
  const formatDate = (time: number, full = false) =>
    new Date(time).toLocaleDateString("ru-RU", {
      timeZone: "UTC",
      ...(granularity === "Месяц"
        ? { month: "long" as const, year: "numeric" as const }
        : {
            day: "numeric" as const,
            month: full ? ("long" as const) : ("short" as const),
            ...(full ? { year: "numeric" as const } : {}),
          }),
    });
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={rows}
        margin={{ top: 18, right: 12, bottom: 8, left: 0 }}
      >
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9566ec" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#9566ec" stopOpacity={0.008} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="#edf0f5"
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          minTickGap={65}
          tickMargin={16}
          tick={{ fill: "#9399a8", fontSize: 11 }}
          tickFormatter={(v) => formatDate(v)}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={64}
          tickMargin={12}
          tick={{ fill: "#9399a8", fontSize: 11 }}
          domain={[0, tickStep * 4]}
          ticks={ticks}
          tickFormatter={(v) =>
            v === 0
              ? `0 ${unit}`
              : v >= 1000000
                ? `${v / 1000000} млн`
                : `${v / 1000} тыс.`
          }
        />
        <Tooltip
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <div className="chart-tooltip">
                <div>{formatDate(Number(label), true)}</div>
                {payload
                  .filter((p) => p.type !== "none")
                  .map((p, i) => (
                    <p key={i}>
                      <span style={{ background: p.color }} />
                      {p.name}
                      <strong>
                        {fmt(Number(p.value))} {unit}
                      </strong>
                    </p>
                  ))}
              </div>
            ) : null
          }
          cursor={{ stroke: "#b79adf", strokeDasharray: "4 4" }}
        />
        {series[1].visible && (
          <Line
            isAnimationActive={false}
            name={series[1].name}
            type="monotone"
            dataKey="comparison"
            stroke="#b7bdce"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={rows.length === 1 ? { r: 4 } : false}
            activeDot={{ r: 4, strokeWidth: 3, stroke: "white" }}
          />
        )}
        {series[0].visible && (
          <Area
            isAnimationActive={false}
            name={series[0].name}
            type="monotone"
            dataKey="value"
            stroke="#9060e8"
            strokeWidth={2.8}
            fill="url(#salesGradient)"
            dot={rows.length === 1 ? { r: 4 } : false}
            activeDot={{ r: 5, strokeWidth: 3, stroke: "white" }}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

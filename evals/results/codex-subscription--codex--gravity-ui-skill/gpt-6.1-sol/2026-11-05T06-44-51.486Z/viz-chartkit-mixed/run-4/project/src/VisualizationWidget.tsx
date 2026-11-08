import { useMemo } from "react";
import ChartKit from "@gravity-ui/chartkit";
import { Button, Loader, Text } from "@gravity-ui/uikit";
import type { ChartData } from "@gravity-ui/charts";
import type { YagrWidgetData } from "@gravity-ui/chartkit/yagr";
import type { VisualizationMode, VisualizationSeries } from "./data";
import "./chartRegistry";

/** Engine-independent widget contract. X is Unix milliseconds in both modes. */
export interface VisualizationWidgetProps {
  mode: VisualizationMode;
  series: VisualizationSeries[];
  height?: number;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}
export function VisualizationWidget({
  mode,
  series,
  height = 310,
  loading,
  error,
  onRetry,
}: VisualizationWidgetProps) {
  const salesData = useMemo<ChartData>(
    () => ({
      chart: { margin: { top: 16, right: 16, bottom: 12, left: 8 } },
      series: {
        data: series.map((s) => ({
          type: "line",
          name: s.name,
          color: s.color,
          data: s.data,
          lineWidth: s.dashed ? 1.8 : 3,
          dashStyle: s.dashed ? "Dash" : "Solid",
          interpolation: { type: "monotone" },
          marker: { enabled: false },
        })),
      },
      xAxis: {
        type: "datetime",
        grid: { enabled: false },
        lineVisible: false,
        ticks: { pixelInterval: 115 },
        labels: { dateFormat: "DD MMM", style: { fontSize: "11px" } },
      },
      yAxis: [
        {
          min: 0,
          grid: { enabled: true },
          lineVisible: false,
          ticks: { pixelInterval: 65 },
          labels: { style: { fontSize: "11px" } },
        },
      ],
      legend: { enabled: false },
    }),
    [series],
  );
  const monitorData = useMemo<YagrWidgetData>(
    () => ({
      data: {
        timeline: series[0]?.data.map((p) => p.x) ?? [],
        graphs: series.map((s) => ({
          id: s.id,
          name: s.name,
          color: s.color,
          data: s.data.map((p) => p.y),
          type: "line",
          width: 1.3,
        })),
        timeZone: "Europe/Moscow",
      },
      libraryConfig: {
        chart: {
          timeMultiplier: 1,
          size: { adaptive: true },
          appearance: { locale: "ru" },
        },
        legend: { show: false },
      },
    }),
    [series],
  );
  const loadingView = () => (
    <div className="chart-state" role="status">
      <Loader size="m" />
      <Text color="secondary">Загружаем график…</Text>
    </div>
  );
  return (
    <div
      className="visualization"
      style={{ height }}
      aria-label={
        mode === "sales"
          ? "Линейный график продаж"
          : "Временной ряд мониторинга"
      }
    >
      {loading ? (
        loadingView()
      ) : error ? (
        <div className="chart-state" role="alert">
          <Text>{error}</Text>
          {onRetry && <Button onClick={onRetry}>Повторить</Button>}
        </div>
      ) : !series.length || !series.some((s) => s.data.length) ? (
        <div className="chart-state">
          <Text color="secondary">Нет данных для отображения</Text>
          <Text variant="caption-2" color="hint">
            Выберите хотя бы одну серию или другой период
          </Text>
        </div>
      ) : mode === "sales" ? (
        <ChartKit
          key="sales"
          type="gravity-charts"
          data={salesData}
          renderPluginLoader={loadingView}
          renderError={({ resetError }) => (
            <div className="chart-state" role="alert">
              <Text>Не удалось загрузить график</Text>
              <Button onClick={resetError}>Повторить</Button>
            </div>
          )}
        />
      ) : (
        <ChartKit
          key="monitoring"
          type="yagr"
          data={monitorData}
          renderPluginLoader={loadingView}
          renderError={({ resetError }) => (
            <div className="chart-state" role="alert">
              <Text>Не удалось загрузить мониторинг</Text>
              <Button onClick={resetError}>Повторить</Button>
            </div>
          )}
        />
      )}
    </div>
  );
}

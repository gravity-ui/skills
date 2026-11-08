export type ChartMode = "sales" | "monitoring";
export type ChartPoint = { timestamp: number; value: number };
export type ChartSeries = {
  id: string;
  name: string;
  color: string;
  points: ChartPoint[];
  dashed?: boolean;
};
/** Shared API for both the SVG sales engine and the canvas monitoring engine. */
export interface ChartRendererProps {
  series: ChartSeries[];
  height?: number;
  unit?: string;
  zoom?: number;
}
export interface VisualizationWidgetProps extends ChartRendererProps {
  mode: ChartMode;
  loading?: boolean;
}

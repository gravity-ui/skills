export type ChartMode = 'sales' | 'monitoring';
export type TimeRange = '7d' | '30d' | '90d';
export interface DataPoint { timestamp: number; value: number; comparison: number }
export interface ChartEngineProps {
  data: DataPoint[];
  comparison: boolean;
  color: string;
  formatValue: (value: number) => string;
}
export interface VisualizationWidgetProps {
  mode: ChartMode;
  onModeChange: (mode: ChartMode) => void;
  range: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  data: DataPoint[];
  loading?: boolean;
}

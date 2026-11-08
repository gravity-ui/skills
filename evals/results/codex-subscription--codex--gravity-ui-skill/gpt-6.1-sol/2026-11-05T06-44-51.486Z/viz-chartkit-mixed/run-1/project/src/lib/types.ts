export type WidgetMode = "sales" | "monitoring";

/** Engine-independent API: timestamps in milliseconds, values in the dataset unit. */
export interface VisualizationData {
  unit: string;
  timeline: number[];
  series: {
    id: string;
    name: string;
    values: (number | null)[];
    comparison?: boolean;
  }[];
}

export interface VisualizationWidgetProps {
  mode: WidgetMode;
  onModeChange: (mode: WidgetMode) => void;
  data: VisualizationData;
  range: string;
  onRangeChange: (range: string) => void;
  updatedAt?: Date;
  onRefresh?: () => void;
  loading?: boolean;
  error?: string;
}

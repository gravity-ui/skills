import type {ComponentType} from 'react';

export type VisualizationMode = 'sales' | 'monitoring';

export interface VisualizationPoint {
  timestamp: number;
  value: number;
}

export interface VisualizationDataset {
  id: string;
  label: string;
  points: VisualizationPoint[];
  color: string;
}

export interface VisualizationData {
  unit: string;
  series: VisualizationDataset[];
}

export interface VisualizationEngineProps {
  data: VisualizationData;
  height: number;
}

export interface VisualizationEngineModule {
  default: ComponentType<VisualizationEngineProps>;
}

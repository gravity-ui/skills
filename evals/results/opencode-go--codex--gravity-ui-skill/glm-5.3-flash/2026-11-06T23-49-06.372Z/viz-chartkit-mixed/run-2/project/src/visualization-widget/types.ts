import type * as React from 'react';

export type VisualizationMode = 'sales' | 'monitoring';

export interface SalesSeries {
    name: string;
    data: Array<{x: number; y: number | null}>;
}

export interface MonitoringSeries {
    name: string;
    color: string;
    data: Array<number | null>;
}

export interface VisualizationWidgetData {
    mode: VisualizationMode;
    sales?: {series: SalesSeries[]};
    monitoring?: {timeline: number[]; series: MonitoringSeries[]};
}

export interface VisualizationEngineProps {
    data: VisualizationWidgetData;
}

export type LazyVisualizationEngine = React.LazyExoticComponent<
    React.ComponentType<VisualizationEngineProps>
>;

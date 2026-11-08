export type ChartMode = 'sales' | 'monitoring';

export interface SalesPoint {
    x: number;
    y: number;
}

export interface SalesSeries {
    name: string;
    data: SalesPoint[];
}

export interface MonitoringPoint {
    timestamp: number;
    value: number;
}

export interface MonitoringSeries {
    name: string;
    color?: string;
    data: MonitoringPoint[];
}

export interface VizWidgetProps {
    mode: ChartMode;
    onChangeMode: (mode: ChartMode) => void;
    salesData: SalesSeries[];
    monitoringData: MonitoringSeries[];
    height?: number;
    className?: string;
}

import type {ChartData} from '@gravity-ui/charts';
import type {RawSerieData, YagrConfig} from '@gravity-ui/yagr';

export type VisualizationMode = 'sales' | 'monitoring';

type MonitoringData = {
    data: {
        graphs: RawSerieData[];
        timeline: number[];
        timeZone?: string;
    };
    libraryConfig: Partial<YagrConfig>;
};

export type VisualizationModeData<Mode extends VisualizationMode> = Mode extends 'sales'
    ? {data: ChartData}
    : MonitoringData;

export type SalesDataset = VisualizationModeData<'sales'>;
export type MonitoringDataset = VisualizationModeData<'monitoring'>;

export type VisualizationWidgetProps = {
    mode: VisualizationMode;
    onModeChange: (mode: VisualizationMode) => void;
};

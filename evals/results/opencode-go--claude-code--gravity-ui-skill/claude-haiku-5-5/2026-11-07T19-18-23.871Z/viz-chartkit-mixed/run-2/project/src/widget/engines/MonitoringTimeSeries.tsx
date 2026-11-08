/**
 * Monitoring engine: a dense time series rendered by `@gravity-ui/yagr` (canvas, uPlot-based).
 * Loaded lazily by the widget only when the `monitoring` mode is shown.
 */
import {useId, useMemo} from 'react';
import YagrChart from '@gravity-ui/yagr/react';
import '@gravity-ui/yagr/index.css';

import {toMonitoringConfig} from '../transform';
import type {EngineProps} from '../types';

export default function MonitoringTimeSeries({series, height, theme}: EngineProps) {
    const config = useMemo(() => toMonitoringConfig(series, theme), [series, theme]);
    // useId yields ":r0:"-style strings; keep only characters that are safe in a DOM id.
    const id = `yagr-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

    return (
        <div className="vw-engine" style={{height}}>
            <YagrChart id={id} config={config} className="vw-yagr" />
        </div>
    );
}

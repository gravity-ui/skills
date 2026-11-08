import React from 'react';

import ChartKit from '@gravity-ui/chartkit';

import {toGravityChartsData, toYagrWidgetData} from './adapters';
import type {VizWidgetProps} from './types';

const DEFAULT_HEIGHT = 360;

/**
 * Single-API visualization widget.
 *
 * The consumer passes `mode` + mode-shaped data; the widget dispatches to the
 * matching ChartKit plugin. Plugin renderers are `React.lazy` inside
 * @gravity-ui/chartkit, so the @gravity-ui/charts bundle is fetched only when
 * `mode="sales"` first renders and the @gravity-ui/yagr bundle only when
 * `mode="monitoring"` first renders.
 *
 * Requires the plugins to be registered once at app entry (see
 * `src/chartkitSetup.ts`) — ChartKit resolves `type` against the global
 * registry and throws for an unregistered type.
 */
export function VizWidget(props: VizWidgetProps) {
    const {height = DEFAULT_HEIGHT} = props;

    return (
        <div style={{height, minWidth: 0, width: '100%'}}>
            {props.mode === 'sales' ? (
                <ChartKit
                    type="gravity-charts"
                    data={toGravityChartsData(props.sales, props.title)}
                />
            ) : (
                <ChartKit type="yagr" data={toYagrWidgetData(props.monitoring)} />
            )}
        </div>
    );
}

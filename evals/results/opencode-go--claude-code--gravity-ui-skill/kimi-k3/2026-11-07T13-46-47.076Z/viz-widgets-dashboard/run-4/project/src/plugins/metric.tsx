import React from 'react';

import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {TriangleDownFill, TriangleUpFill} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';

import {WidgetFrame} from './WidgetFrame';

export interface MetricWidgetData {
    title: string;
    value: string;
    delta: string;
    trend: 'up' | 'down';
}

/**
 * Metric (KPI) widget plugin: a big value with a trend delta
 * inside the shared widget card.
 */
const MetricWidget = React.forwardRef<HTMLDivElement, PluginWidgetProps>(
    function MetricWidget({data}, ref) {
        const {title, value, delta, trend} = data as unknown as MetricWidgetData;
        const isUp = trend === 'up';

        return (
            <WidgetFrame title={title} ref={ref}>
                <div className="metric-widget">
                    <Text variant="display-2" className="metric-widget__value">
                        {value}
                    </Text>
                    <span className="metric-widget__delta">
                        <Icon
                            data={isUp ? TriangleUpFill : TriangleDownFill}
                            size={12}
                            className={
                                isUp
                                    ? 'metric-widget__delta-icon_up'
                                    : 'metric-widget__delta-icon_down'
                            }
                        />
                        <Text variant="body-2" color={isUp ? 'positive' : 'danger'}>
                            {delta}
                        </Text>
                        <Text variant="body-2" color="hint">
                            к прошлому периоду
                        </Text>
                    </span>
                </div>
            </WidgetFrame>
        );
    },
);

export const metricPlugin: Plugin = {
    type: 'metric',
    defaultLayout: {w: 9, h: 6, minW: 5, minH: 4},
    renderer(props, forwardedRef) {
        return <MetricWidget {...props} ref={forwardedRef as React.Ref<HTMLDivElement>} />;
    },
};

import React from 'react';
import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {ArrowDown, ArrowUp} from '@gravity-ui/icons';
import {Icon, Text} from '@gravity-ui/uikit';

import {WidgetFrame} from './WidgetFrame';

export type StatWidgetData = {
    label: string;
    value: string;
    delta?: string;
    /** Direction of the change — drives the arrow icon. */
    trend?: 'up' | 'down';
    /** Whether the change is good or bad news — drives the status color. */
    sentiment?: 'positive' | 'negative';
};

function StatWidget({data}: PluginWidgetProps) {
    const {label, value, delta, trend, sentiment} = data as StatWidgetData;

    const deltaColor = sentiment === 'negative' ? 'danger' : 'positive';
    const trendIcon = trend === 'down' ? ArrowDown : ArrowUp;

    return (
        <WidgetFrame>
            <div className="stat-widget">
                <Text variant="body-2" color="secondary" ellipsis title={label}>
                    {label}
                </Text>
                <Text variant="display-2">{value}</Text>
                {delta ? (
                    <div className="stat-widget__delta">
                        <Icon
                            data={trendIcon}
                            size={14}
                            style={{
                                color: `var(--g-color-text-${deltaColor})`,
                                flexShrink: 0,
                            }}
                        />
                        <Text variant="body-2" color={deltaColor}>
                            {delta}
                        </Text>
                        <Text variant="body-2" color="hint">
                            к прошлому месяцу
                        </Text>
                    </div>
                ) : null}
            </div>
        </WidgetFrame>
    );
}

export const pluginStat: Plugin = {
    type: 'stat',
    defaultLayout: {w: 12, h: 5},
    renderer: (props) => <StatWidget {...props} />,
};

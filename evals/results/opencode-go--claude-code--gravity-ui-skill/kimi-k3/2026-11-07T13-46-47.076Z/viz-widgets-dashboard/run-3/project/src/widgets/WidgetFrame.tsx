import React from 'react';
import {Text} from '@gravity-ui/uikit';

type WidgetFrameProps = {
    title?: string;
    children: React.ReactNode;
};

/**
 * Shared card chrome for all custom widgets: fills the DashKit grid item
 * (`.dashkit-item__renderer` is absolutely positioned at inset 0).
 */
export function WidgetFrame({title, children}: WidgetFrameProps) {
    return (
        <div className="widget-frame">
            {title ? (
                <div className="widget-frame__header">
                    <Text variant="subheader-2" ellipsis title={title}>
                        {title}
                    </Text>
                </div>
            ) : null}
            <div className="widget-frame__body">{children}</div>
        </div>
    );
}

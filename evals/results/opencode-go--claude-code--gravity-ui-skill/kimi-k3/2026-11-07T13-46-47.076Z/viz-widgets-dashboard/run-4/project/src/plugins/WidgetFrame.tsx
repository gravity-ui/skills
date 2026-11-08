import React from 'react';

import {Card, Text} from '@gravity-ui/uikit';

interface WidgetFrameProps {
    title: string;
    children: React.ReactNode;
}

/**
 * Shared chrome for dashboard widgets: a raised card with a header
 * and a body that fills the rest of the grid item.
 */
export const WidgetFrame = React.forwardRef<HTMLDivElement, WidgetFrameProps>(
    function WidgetFrame({title, children}, ref) {
        return (
            <Card view="raised" className="widget-frame" ref={ref}>
                <div className="widget-frame__header">
                    <Text variant="subheader-1" ellipsis title={title}>
                        {title}
                    </Text>
                </div>
                <div className="widget-frame__body">{children}</div>
            </Card>
        );
    },
);

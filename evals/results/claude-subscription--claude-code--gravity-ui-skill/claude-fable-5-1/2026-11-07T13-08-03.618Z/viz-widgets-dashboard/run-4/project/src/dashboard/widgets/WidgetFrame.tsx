import type {ReactNode} from 'react';
import {Card, Flex, Text} from '@gravity-ui/uikit';

interface WidgetFrameProps {
    title?: string;
    children: ReactNode;
}

/** Common chrome for a custom widget: fills the grid cell, header stays, body scrolls. */
export function WidgetFrame({title, children}: WidgetFrameProps) {
    return (
        <Card view="outlined" type="container" className="dashboard-widget">
            {title ? (
                <Text variant="subheader-1" color="secondary" ellipsis className="dashboard-widget__title">
                    {title}
                </Text>
            ) : null}
            <Flex direction="column" grow className="dashboard-widget__body">
                {children}
            </Flex>
        </Card>
    );
}

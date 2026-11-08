import React from 'react';

import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Text} from '@gravity-ui/uikit';

import {WidgetFrame} from './WidgetFrame';

export interface NoteWidgetData {
    title: string;
    text: string;
}

/**
 * Note widget plugin: a titled text block inside the shared widget card,
 * so it matches the chrome of the chart and metric widgets.
 */
const NoteWidget = React.forwardRef<HTMLDivElement, PluginWidgetProps>(
    function NoteWidget({data}, ref) {
        const {title, text} = data as unknown as NoteWidgetData;

        return (
            <WidgetFrame title={title} ref={ref}>
                <div className="note-widget">
                    <Text variant="body-2" color="secondary">
                        {text}
                    </Text>
                </div>
            </WidgetFrame>
        );
    },
);

export const notePlugin: Plugin = {
    type: 'note',
    defaultLayout: {w: 12, h: 6, minW: 5, minH: 4},
    renderer(props, forwardedRef) {
        return <NoteWidget {...props} ref={forwardedRef as React.Ref<HTMLDivElement>} />;
    },
};

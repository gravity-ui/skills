import React from 'react';
import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Text} from '@gravity-ui/uikit';

import {WidgetFrame} from './WidgetFrame';

export type NoteWidgetData = {
    title: string;
    text: string;
};

function NoteWidget({data}: PluginWidgetProps) {
    const {title, text} = data as NoteWidgetData;

    return (
        <WidgetFrame title={title}>
            <div className="note-widget">
                <Text variant="body-2" color="secondary">
                    {text}
                </Text>
            </div>
        </WidgetFrame>
    );
}

export const pluginNote: Plugin = {
    type: 'note',
    defaultLayout: {w: 12, h: 6},
    renderer: (props) => <NoteWidget {...props} />,
};

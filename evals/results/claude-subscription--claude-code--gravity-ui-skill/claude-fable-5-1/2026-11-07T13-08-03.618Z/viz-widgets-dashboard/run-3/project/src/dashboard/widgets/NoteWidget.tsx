import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import {Text} from '@gravity-ui/uikit';

import {WidgetFrame} from './WidgetFrame';

export interface NoteWidgetData {
  title: string;
  text: string;
}

export function NoteWidget(props: PluginWidgetProps) {
  const data = props.data as unknown as NoteWidgetData;

  return (
    <WidgetFrame title={data.title}>
      <Text variant="body-1" as="p" style={{margin: 0, whiteSpace: 'pre-line'}}>
        {data.text}
      </Text>
    </WidgetFrame>
  );
}

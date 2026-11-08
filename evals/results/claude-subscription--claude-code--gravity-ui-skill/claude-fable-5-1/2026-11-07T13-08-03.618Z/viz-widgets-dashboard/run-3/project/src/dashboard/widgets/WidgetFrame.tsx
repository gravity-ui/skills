import type {ReactNode} from 'react';
import {Card, Flex, Text} from '@gravity-ui/uikit';

interface WidgetFrameProps {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
}

/** Общая рамка виджета: заполняет ячейку сетки целиком, шапка не сжимается, тело скроллится. */
export function WidgetFrame({title, extra, children}: WidgetFrameProps) {
  return (
    <Card type="container" view="filled" className="dashboard-widget">
      <Flex alignItems="center" gap={2} className="dashboard-widget__header">
        <Text variant="subheader-1" ellipsis style={{flex: 1, minWidth: 0}}>
          {title}
        </Text>
        {extra ? <div style={{flexShrink: 0}}>{extra}</div> : null}
      </Flex>
      <div className="dashboard-widget__body">{children}</div>
    </Card>
  );
}

import type {ReactNode} from 'react';
import {Card, Text} from '@gravity-ui/uikit';

interface WidgetFrameProps {
    title: string;
    children: ReactNode;
}

/** Общая обёртка кастомных виджетов: карточка на всю ячейку сетки, заголовок, прокручиваемое тело. */
export function WidgetFrame({title, children}: WidgetFrameProps) {
    return (
        <Card type="container" view="filled" className="dashboard-widget">
            <Text variant="subheader-2" ellipsis className="dashboard-widget__title">
                {title}
            </Text>
            <div className="dashboard-widget__body">{children}</div>
        </Card>
    );
}

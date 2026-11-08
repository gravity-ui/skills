import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import {Card, Flex, Label, Progress, Text} from '@gravity-ui/uikit';
import type {ReactNode} from 'react';

import type {EventStatus, EventsData, GoalsData, MetricData, NoteData} from './types';

const EVENT_STATUS_TEXT: Record<EventStatus, string> = {
    success: 'Успех',
    warning: 'Внимание',
    danger: 'Ошибка',
    info: 'Инфо',
};

function WidgetCard({title, children}: {title: string; children: ReactNode}) {
    return (
        <Card type="container" view="outlined" className="widget">
            <Text variant="subheader-2" ellipsis className="widget__title">
                {title}
            </Text>
            <div className="widget__body">{children}</div>
        </Card>
    );
}

export function MetricWidget({data}: PluginWidgetProps) {
    const {title, value, delta, inverted} = data as unknown as MetricData;
    const isGood = inverted ? delta <= 0 : delta >= 0;
    const sign = delta > 0 ? '+' : '';

    return (
        <WidgetCard title={title}>
            <Flex direction="column" gap={2}>
                <Text variant="display-1" ellipsis>
                    {value}
                </Text>
                <Flex gap={2} alignItems="center">
                    <Label theme={isGood ? 'success' : 'danger'} size="xs">
                        {`${sign}${delta}%`}
                    </Label>
                    <Text color="secondary" variant="caption-2">
                        к прошлому месяцу
                    </Text>
                </Flex>
            </Flex>
        </WidgetCard>
    );
}

export function GoalsWidget({data}: PluginWidgetProps) {
    const {title, goals} = data as unknown as GoalsData;

    return (
        <WidgetCard title={title}>
            <Flex direction="column" gap={3}>
                {goals.map((goal) => (
                    <Flex key={goal.name} direction="column" gap={1}>
                        <Flex justifyContent="space-between" gap={2}>
                            <Text ellipsis style={{minWidth: 0}}>
                                {goal.name}
                            </Text>
                            <Text color="secondary" style={{flexShrink: 0}}>
                                {goal.progress}%
                            </Text>
                        </Flex>
                        <Progress
                            value={goal.progress}
                            size="s"
                            theme={goal.progress >= 100 ? 'success' : 'info'}
                        />
                    </Flex>
                ))}
            </Flex>
        </WidgetCard>
    );
}

export function EventsWidget({data}: PluginWidgetProps) {
    const {title, events} = data as unknown as EventsData;

    return (
        <WidgetCard title={title}>
            <Flex direction="column" gap={3}>
                {events.map((event, index) => (
                    <Flex key={index} gap={2} alignItems="center">
                        <Label theme={event.status} size="xs" className="widget__fixed">
                            {EVENT_STATUS_TEXT[event.status]}
                        </Label>
                        <Text ellipsis style={{flex: 1, minWidth: 0}}>
                            {event.text}
                        </Text>
                        <Text color="secondary" variant="caption-2" style={{flexShrink: 0}}>
                            {event.time}
                        </Text>
                    </Flex>
                ))}
            </Flex>
        </WidgetCard>
    );
}

export function NoteWidget({data}: PluginWidgetProps) {
    const {title, text} = data as unknown as NoteData;

    return (
        <WidgetCard title={title}>
            <Text as="p" className="widget__note" color={text ? 'primary' : 'secondary'}>
                {text || 'Пустая заметка — откройте настройки виджета, чтобы добавить текст.'}
            </Text>
        </WidgetCard>
    );
}

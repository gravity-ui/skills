import type {Plugin, PluginWidgetProps} from '@gravity-ui/dashkit';
import {Flex, Text} from '@gravity-ui/uikit';

import {WidgetFrame} from './WidgetFrame';

export interface StatWidgetData {
    label: string;
    value: number;
    unit?: string;
    /** Change vs the previous period, in percent. */
    delta?: number;
    /** Whether growth is a good thing (affects delta color). */
    upIsGood?: boolean;
    period?: string;
}

const compact = new Intl.NumberFormat('ru-RU', {notation: 'compact', maximumFractionDigits: 1});

function StatWidget({data}: PluginWidgetProps) {
    const {label, value, unit, delta, upIsGood = true, period = 'к прошлой неделе'} = data as unknown as StatWidgetData;
    const hasDelta = typeof delta === 'number';
    const isGood = hasDelta && (delta >= 0) === upIsGood;

    return (
        <WidgetFrame>
            <Flex direction="column" gap={1} justifyContent="center" grow>
                <Text variant="body-1" color="secondary">
                    {label}
                </Text>
                <Flex alignItems="baseline" gap={1}>
                    <Text variant="display-1">{compact.format(value)}</Text>
                    {unit ? (
                        <Text variant="body-2" color="secondary">
                            {unit}
                        </Text>
                    ) : null}
                </Flex>
                {hasDelta ? (
                    <Flex gap={1} alignItems="baseline">
                        <Text variant="body-1" color={isGood ? 'positive' : 'danger'}>
                            {delta > 0 ? '+' : ''}
                            {delta.toLocaleString('ru-RU', {maximumFractionDigits: 1})}%
                        </Text>
                        <Text variant="caption-2" color="hint">
                            {period}
                        </Text>
                    </Flex>
                ) : null}
            </Flex>
        </WidgetFrame>
    );
}

export const statPlugin: Plugin = {
    type: 'stat',
    defaultLayout: {w: 9, h: 6, minW: 6, minH: 5},
    renderer: (props) => <StatWidget {...props} />,
};

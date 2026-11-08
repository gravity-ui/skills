import {Button, Card, Flex, Icon} from '@gravity-ui/uikit';
import type {CSSProperties} from 'react';
import {Xmark} from '@gravity-ui/icons';

export type WidgetSize = 'small' | 'medium' | 'large';

interface WidgetShellProps {
    title: string;
    onRemove?: () => void;
    onSizeChange?: (size: WidgetSize) => void;
    size?: WidgetSize;
    style?: CSSProperties;
    children: React.ReactNode;
}

const sizeLabels: Record<WidgetSize, string> = {
    small: 'S',
    medium: 'M',
    large: 'L',
};

const nextSizes: Record<WidgetSize, WidgetSize> = {
    small: 'medium',
    medium: 'large',
    large: 'small',
};

export function WidgetShell({
    title,
    onRemove,
    onSizeChange,
    size = 'medium',
    style,
    children,
}: WidgetShellProps) {
    return (
        <Card view="raised" style={{...style, padding: 16, overflow: 'hidden'}}>
            <Flex direction="column" gap={10} height="100%">
                <Flex justifyContent="space-between" alignItems="center" shrink={0}>
                    <strong>{title}</strong>
                    <Flex gap={4} alignItems="center">
                        {onSizeChange && (
                            <Button
                                size="xs"
                                view="flat"
                                onClick={() => onSizeChange(nextSizes[size])}
                            >
                                {sizeLabels[size]}
                            </Button>
                        )}
                        {onRemove && (
                            <Button size="xs" view="flat-contrast" onClick={onRemove}>
                                <Icon data={Xmark} size={12} />
                            </Button>
                        )}
                    </Flex>
                </Flex>
                <Flex grow={1} minHeight={0}>
                    {children}
                </Flex>
            </Flex>
        </Card>
    );
}

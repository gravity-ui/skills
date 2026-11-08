import React, {useState, useCallback} from 'react';
import type {ConfigItem, ConfigLayout} from '@gravity-ui/dashkit';
import {DashKit, DashKitDnDWrapper, ActionPanel} from '@gravity-ui/dashkit';
import {Icon, Text, Flex, Switch} from '@gravity-ui/uikit';
import {ChartColumn} from '@gravity-ui/icons';
import {BarsAscendingAlignLeft} from '@gravity-ui/icons';
import {LayoutHeader} from '@gravity-ui/icons';
import {Text as TextIcon} from '@gravity-ui/icons';
import {SquareDashedText} from '@gravity-ui/icons';

import './plugins';

function buildConfig(): {
    salt: string;
    counter: number;
    items: ConfigItem[];
    layout: ConfigLayout[];
    aliases: Record<string, string[][]>;
    connections: {from: string; to: string; kind: 'ignore'}[];
} {
    const items: ConfigItem[] = [
        {
            id: 'title-1',
            data: {size: 'l', text: 'My Dashboard', showInTOC: true},
            type: 'title',
            namespace: 'default',
        },
        {
            id: 'text-1',
            data: {
                text: '*Welcome!* This dashboard is built with **DashKit**. Drag widgets, resize them, and toggle edit mode to customize your view.',
            },
            type: 'text',
            namespace: 'default',
        },
        {
            id: 'metric-1',
            data: {label: 'Revenue', value: '$12.4K', delta: '+8.2%', deltaPositive: true},
            type: 'metric',
            namespace: 'default',
        },
        {
            id: 'metric-2',
            data: {label: 'Users', value: '3,842', delta: '+12.5%', deltaPositive: true},
            type: 'metric',
            namespace: 'default',
        },
        {
            id: 'metric-3',
            data: {label: 'Churn', value: '2.1%', delta: '-0.3%', deltaPositive: true},
            type: 'metric',
            namespace: 'default',
        },
        {
            id: 'chart-1',
            data: {title: 'Weekly Performance'},
            type: 'chart',
            namespace: 'default',
        },
        {
            id: 'table-1',
            data: {title: 'Recent Activity'},
            type: 'table',
            namespace: 'default',
        },
    ];

    const layout: ConfigLayout[] = [
        {i: 'title-1', x: 0, y: 0, w: 24, h: 2},
        {i: 'text-1', x: 0, y: 2, w: 24, h: 3},
        {i: 'metric-1', x: 0, y: 5, w: 8, h: 4},
        {i: 'metric-2', x: 8, y: 5, w: 8, h: 4},
        {i: 'metric-3', x: 16, y: 5, w: 8, h: 4},
        {i: 'chart-1', x: 0, y: 9, w: 12, h: 10},
        {i: 'table-1', x: 12, y: 9, w: 12, h: 10},
    ];

    return {
        salt: 'dashboard-1',
        counter: items.length,
        items,
        layout,
        aliases: {},
        connections: [],
    };
}

export function App() {
    const [config, setConfig] = useState(() => buildConfig());
    const [editMode, setEditMode] = useState(true);

    const onChange = useCallback(
        (data: {config: typeof config; itemsStateAndParams: any}) => {
            setConfig(data.config);
        },
        [],
    );

    const handleDrop = useCallback((dropProps: any) => {
        dropProps.commit();
    }, []);

    const handleItemEdit = useCallback((item: ConfigItem) => {
        // In a real app this would open an edit modal
    }, []);

    const actionPanelItems = [
        {
            id: 'add-title',
            icon: <Icon data={LayoutHeader} />,
            title: 'Title',
            dragProps: {type: 'title', layout: {w: 12, h: 2}},
        },
        {
            id: 'add-text',
            icon: <Icon data={TextIcon} />,
            title: 'Text',
            dragProps: {type: 'text', layout: {w: 8, h: 4}},
        },
        {
            id: 'add-metric',
            icon: <Icon data={BarsAscendingAlignLeft} />,
            title: 'Metric',
            dragProps: {type: 'metric', layout: {w: 6, h: 4}},
        },
        {
            id: 'add-chart',
            icon: <Icon data={ChartColumn} />,
            title: 'Chart',
            dragProps: {type: 'chart', layout: {w: 12, h: 10}},
        },
        {
            id: 'add-table',
            icon: <Icon data={SquareDashedText} />,
            title: 'Table',
            dragProps: {type: 'table', layout: {w: 18, h: 10}},
        },
    ];

    return (
        <div style={{padding: 'var(--g-spacing-4)'}}>
            <Flex
                alignItems="center"
                justifyContent="space-between"
                style={{marginBottom: 'var(--g-spacing-4)'}}
            >
                <Text variant="header-1">Dashboard</Text>
                <Flex alignItems="center" gap={2}>
                    <Text variant="body-1" color="secondary">
                        Edit mode
                    </Text>
                    <Switch
                        checked={editMode}
                        onUpdate={setEditMode}
                    />
                </Flex>
            </Flex>

            <DashKitDnDWrapper>
                <div>
                    <DashKit
                        config={config}
                        editMode={editMode}
                        onChange={onChange}
                        onDrop={handleDrop}
                        onItemEdit={handleItemEdit}
                    />
                    {editMode && (
                        <ActionPanel
                            items={actionPanelItems}
                            toggleAnimation
                        />
                    )}
                </div>
            </DashKitDnDWrapper>
        </div>
    );
}

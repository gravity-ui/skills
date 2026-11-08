import React from 'react';
import {ActionPanel, DashKit, DashKitDnDWrapper} from '@gravity-ui/dashkit';
import type {ActionPanelItem, Config, ItemDropProps} from '@gravity-ui/dashkit';
import {Button, Flex, Icon, Switch} from '@gravity-ui/uikit';

import {DEFAULT_CONFIG, WIDGET_CATALOG, getCatalogEntry} from './catalog';

const STORAGE_KEY = 'gravity-dashboard-config';

function isConfig(value: unknown): value is Config {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const candidate = value as Partial<Config>;
    return (
        typeof candidate.salt === 'string' &&
        typeof candidate.counter === 'number' &&
        Array.isArray(candidate.items) &&
        Array.isArray(candidate.layout)
    );
}

/** Restore the saved layout; fall back to the default if storage is empty, corrupt or unavailable. */
function loadConfig(): Config {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed: unknown = JSON.parse(raw);
            if (isConfig(parsed)) {
                // Older saves may lack these optional fields.
                return {...parsed, aliases: parsed.aliases ?? {}, connections: parsed.connections ?? []};
            }
        }
    } catch {
        // Ignore storage errors and use the default layout.
    }
    return DEFAULT_CONFIG;
}

function saveConfig(config: Config) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
        // Storage can be full or blocked; the layout then lives only for this session.
    }
}

export function Dashboard() {
    const [config, setConfig] = React.useState<Config>(loadConfig);
    const [editMode, setEditMode] = React.useState(false);

    React.useEffect(() => {
        saveConfig(config);
    }, [config]);

    // DashKit.setItem returns a new config; it does not mutate the old one.
    const addWidget = (type: string) => {
        const entry = getCatalogEntry(type);
        if (!entry) {
            return;
        }
        setConfig((current) =>
            DashKit.setItem({
                item: {type, data: entry.createData()},
                config: current,
            }),
        );
    };

    const handleDrop = (drop: ItemDropProps) => {
        const {dragProps, itemLayout, newLayout} = drop;
        const entry = getCatalogEntry(dragProps.type);
        if (entry) {
            setConfig((current) =>
                DashKit.setItem({
                    item: {
                        type: dragProps.type,
                        data: entry.createData(),
                        layout: {x: itemLayout.x, y: itemLayout.y, w: itemLayout.w, h: itemLayout.h},
                    },
                    config: current,
                    options: {updateLayout: newLayout},
                }),
            );
        }
        drop.commit();
    };

    const actionItems: ActionPanelItem[] = WIDGET_CATALOG.map((entry) => ({
        id: entry.type,
        title: entry.title,
        icon: <Icon data={entry.icon} size={16} />,
        qa: `add-${entry.type}`,
        onClick: () => addWidget(entry.type),
        dragProps: {type: entry.type, layout: entry.layout},
    }));

    return (
        <Flex direction="column" gap={4}>
            <Flex alignItems="center" justifyContent="space-between" gap={4}>
                <Switch checked={editMode} onUpdate={setEditMode} content="Режим редактирования" />
                <Button view="outlined" disabled={!editMode} onClick={() => setConfig(DEFAULT_CONFIG)}>
                    Сбросить макет
                </Button>
            </Flex>

            <DashKitDnDWrapper>
                <div>
                    <DashKit
                        config={config}
                        editMode={editMode}
                        overlayMenuItems={['copy', 'delete']}
                        onChange={({config: next}) => setConfig(next)}
                        onDrop={handleDrop}
                    />
                    {editMode && <ActionPanel items={actionItems} />}
                </div>
            </DashKitDnDWrapper>
        </Flex>
    );
}

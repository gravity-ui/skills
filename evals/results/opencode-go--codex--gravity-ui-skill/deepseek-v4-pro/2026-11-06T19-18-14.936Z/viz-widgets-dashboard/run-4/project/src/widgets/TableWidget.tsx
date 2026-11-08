import React from 'react';
import {Text, Card, Flex} from '@gravity-ui/uikit';
import type {PluginWidgetProps} from '@gravity-ui/dashkit';

interface TableData {
    title?: string;
    headers?: string[];
    rows?: string[][];
}

const DEFAULT_HEADERS = ['Name', 'Status', 'Value', 'Date'];
const DEFAULT_ROWS = [
    ['Alpha', 'Active', '1,234', '2026-01-15'],
    ['Beta', 'Inactive', '892', '2026-02-20'],
    ['Gamma', 'Active', '3,567', '2026-03-10'],
    ['Delta', 'Pending', '456', '2026-04-05'],
];

export function TableWidget(props: PluginWidgetProps<Record<string, string | string[]>>) {
    const data = props.data as unknown as TableData | undefined;
    const title = data?.title ?? 'Table';
    const headers = data?.headers ?? DEFAULT_HEADERS;
    const rows = data?.rows ?? DEFAULT_ROWS;

    return (
        <Card view="filled" style={{height: '100%', padding: 0}}>
            <Flex direction="column" gap={2} style={{height: '100%', padding: 'var(--g-spacing-4)'}}>
                <Text variant="subheader-1">{title}</Text>
                <div style={{flex: 1, minHeight: 0, overflow: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse'}}>
                        <thead>
                            <tr
                                style={{
                                    borderBottom: '1px solid var(--g-color-line-generic)',
                                }}
                            >
                                {headers.map((h, i) => (
                                    <th
                                        key={i}
                                        style={{
                                            textAlign: 'left',
                                            padding: 'var(--g-spacing-2) var(--g-spacing-3)',
                                        }}
                                    >
                                        <Text variant="subheader-1" color="secondary">
                                            {h}
                                        </Text>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, ri) => (
                                <tr
                                    key={ri}
                                    style={{
                                        borderBottom:
                                            '1px solid var(--g-color-line-generic)',
                                    }}
                                >
                                    {row.map((cell, ci) => (
                                        <td
                                            key={ci}
                                            style={{
                                                padding: 'var(--g-spacing-2) var(--g-spacing-3)',
                                            }}
                                        >
                                            <Text variant="body-1">{cell}</Text>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Flex>
        </Card>
    );
}

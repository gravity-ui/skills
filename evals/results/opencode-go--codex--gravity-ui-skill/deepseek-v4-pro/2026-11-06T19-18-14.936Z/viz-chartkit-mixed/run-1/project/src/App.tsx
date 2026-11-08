import {useState} from 'react';
import {Text} from '@gravity-ui/uikit';
import {VizWidget} from './viz-widget';
import type {ChartMode} from './viz-widget';

const SALES_DATA = [
    {
        name: 'Товар А',
        data: [
            {x: 1, y: 1200},
            {x: 2, y: 1850},
            {x: 3, y: 1400},
            {x: 4, y: 2100},
            {x: 5, y: 1900},
            {x: 6, y: 2400},
            {x: 7, y: 2200},
        ],
    },
    {
        name: 'Товар Б',
        data: [
            {x: 1, y: 800},
            {x: 2, y: 950},
            {x: 3, y: 1100},
            {x: 4, y: 1000},
            {x: 5, y: 1300},
            {x: 6, y: 1200},
            {x: 7, y: 1500},
        ],
    },
];

const NOW = Date.now();
const MONITORING_DATA = [
    {
        name: 'CPU',
        color: '#4DA2F1',
        data: Array.from({length: 60}, (_, i) => ({
            timestamp: NOW - (59 - i) * 60_000,
            value: 20 + Math.random() * 40,
        })),
    },
    {
        name: 'Memory',
        color: '#FF3D64',
        data: Array.from({length: 60}, (_, i) => ({
            timestamp: NOW - (59 - i) * 60_000,
            value: 40 + Math.random() * 30,
        })),
    },
];

export function App() {
    const [mode, setMode] = useState<ChartMode>('sales');

    return (
        <div style={{padding: 24, maxWidth: 900, margin: '0 auto'}}>
            <Text variant="header-1" style={{marginBottom: 16}}>
                Виджет визуализации
            </Text>

            <VizWidget
                mode={mode}
                onChangeMode={setMode}
                salesData={SALES_DATA}
                monitoringData={MONITORING_DATA}
                height={400}
            />
        </div>
    );
}

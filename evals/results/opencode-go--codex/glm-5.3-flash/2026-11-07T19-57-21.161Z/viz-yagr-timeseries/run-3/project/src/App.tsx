import {useEffect, useMemo, useState} from 'react';
import {SegmentedRadioGroup, ThemeProvider} from '@gravity-ui/uikit';

import {CpuLoadChart, type CpuLoadPoint} from './CpuLoadChart';
import './App.css';

const POINT_INTERVAL_MS = 60_000;
const HISTORY_LIMIT = 24 * 60;

function generateInitialData(): CpuLoadPoint[] {
    const now = Date.now();

    return Array.from({length: HISTORY_LIMIT}, (_, index) => {
        const timestamp = now - (HISTORY_LIMIT - index) * POINT_INTERVAL_MS;

        return {
            timestamp,
            load: Math.min(96, Math.max(4, 48 + 24 * Math.sin(index / 90) + Math.sin(index / 7) * 6)),
        };
    });
}

export function App() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [points, setPoints] = useState(generateInitialData);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setPoints((previousPoints) => {
                const lastPoint = previousPoints.at(-1);

                if (!lastPoint) {
                    return previousPoints;
                }

                const nextPoint: CpuLoadPoint = {
                    timestamp: lastPoint.timestamp + POINT_INTERVAL_MS,
                    load: Math.min(96, Math.max(4, lastPoint.load + (Math.random() - 0.5) * 4)),
                };

                return [...previousPoints.slice(-(HISTORY_LIMIT - 1)), nextPoint];
            });
        }, 200);

        return () => window.clearInterval(intervalId);
    }, []);

    const lastLoad = useMemo(() => points.at(-1)?.load ?? 0, [points]);

    return (
        <ThemeProvider theme={theme}>
            <div className="monitoring">
                <div className="monitoring__header">
                    <h1>Мониторинг</h1>
                    <span>CPU: {lastLoad.toFixed(1)}%</span>
                    <SegmentedRadioGroup<'light' | 'dark'>
                        value={theme}
                        onUpdate={setTheme}
                        options={[
                            {value: 'light', content: 'Светлая'},
                            {value: 'dark', content: 'Тёмная'},
                        ]}
                    />
                </div>
                <CpuLoadChart className="monitoring__chart" data={points} />
            </div>
        </ThemeProvider>
    );
}

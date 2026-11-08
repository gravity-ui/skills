import '@gravity-ui/yagr/index.css';

import Yagr, {type MinimalValidConfig} from '@gravity-ui/yagr';
import {useThemeValue} from '@gravity-ui/uikit';
import {useEffect, useMemo, useRef, useState} from 'react';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_POINTS = 40_000;
const CPU_COLOR = 'var(--g-color-base-positive-heavy)';

type CpuPoint = {
    timestamp: number;
    load: number;
};

type YagrChart = {
    setSeries(
        timeline: number[],
        series: {data: number[]}[],
        options: {incremental?: boolean; splice?: boolean},
    ): void;
    setTheme(theme: 'light' | 'dark'): void;
    dispose(): void;
};

type YagrThemeConfig = {
    chart: {
        appearance: {
            theme: 'light' | 'dark';
        };
    };
};

type ThemeAwareYagrConfig = MinimalValidConfig & YagrThemeConfig;

function roundTimestamp(timestamp: number): number {
    return Math.floor(timestamp / 1000) * 1000;
}

function createInitialData(): CpuPoint[] {
    const points: CpuPoint[] = [];
    const pointCount = MAX_POINTS - 1;
    const interval = DAY_MS / pointCount;
    const startTime = roundTimestamp(Date.now()) - DAY_MS;

    for (let index = 0; index < pointCount; index += 1) {
        const timestamp = startTime + index * interval;
        const minuteOfDay = new Date(timestamp).getMinutes();

        points.push({
            timestamp,
            load: Math.round(30 + Math.sin(minuteOfDay / 10) * 20 + Math.random() * 15),
        });
    }

    return points;
}

function createRealtimePoint(lastPoint: CpuPoint, timestamp: number): CpuPoint {
    return {
        timestamp: roundTimestamp(timestamp),
        load: Math.max(0, Math.min(100, lastPoint.load + (Math.random() - 0.5) * 10)),
    };
}

export function CpuLoadChart() {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<YagrChart | null>(null);
    const pointsRef = useRef<CpuPoint[]>([]);
    const [isReady, setIsReady] = useState(false);
    const themeValue = useThemeValue();
    const yagrTheme = themeValue.startsWith('dark') ? 'dark' : 'light';

    const initialData = useMemo(() => createInitialData(), []);

    useEffect(() => {
        const root = rootRef.current;

        if (!root) {
            return;
        }

        let cancelled = false;
        pointsRef.current = initialData;

        requestAnimationFrame(() => {
            if (cancelled || !rootRef.current) {
                return;
            }

            const config: ThemeAwareYagrConfig = {
                timeline: initialData.map((point) => point.timestamp),
                series: [
                    {
                        id: 'cpu-load',
                        type: 'line',
                        name: 'CPU',
                        data: initialData.map((point) => point.load),
                        color: CPU_COLOR,
                    },
                ],
                chart: {
                    appearance: {theme: yagrTheme},
                    size: {adaptive: true, resizeDebounceMs: 75},
                },
                legend: {show: false},
                cursor: {markersSize: 0},
            };

            chartRef.current = new Yagr(rootRef.current!, config) as unknown as YagrChart;
            setIsReady(true);
        });

        return () => {
            cancelled = true;
            chartRef.current?.dispose();
            chartRef.current = null;
            pointsRef.current = [];
            root.innerHTML = '';
            setIsReady(false);
        };
    }, [initialData]);

    useEffect(() => {
        chartRef.current?.setTheme(yagrTheme);
    }, [yagrTheme]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            const chart = chartRef.current;
            const points = pointsRef.current;
            const lastPoint = points[points.length - 1];

            if (!chart || !lastPoint) {
                return;
            }

            const point = createRealtimePoint(lastPoint, Date.now());

            if (point.timestamp <= lastPoint.timestamp) {
                return;
            }

            points.push(point);
            if (points.length > MAX_POINTS) {
                points.shift();
            }

            chart.setSeries([point.timestamp], [{data: [point.load]}], {
                incremental: true,
                splice: false,
            });
        }, 1_000);

        return () => window.clearInterval(interval);
    }, []);

    return (
        <section
            style={{
                position: 'relative',
                height: '100%',
                minHeight: 280,
                borderRadius: "var(--g-border-radius-m)",
                border: '1px solid var(--g-color-line-generic)',
                overflow: 'hidden',
            }}
        >
            <div ref={rootRef} style={{width: '100%', height: '100%'}} />
            {!isReady && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        placeItems: 'center',
                        background: 'var(--g-color-base-background)',
                    }}
                >
                    Загрузка…
                </div>
            )}
        </section>
    );
}

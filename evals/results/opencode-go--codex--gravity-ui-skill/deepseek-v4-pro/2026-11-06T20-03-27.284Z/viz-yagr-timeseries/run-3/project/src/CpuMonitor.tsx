import React, {useEffect, useRef} from 'react';
import YagrReact from '@gravity-ui/yagr/react';
import type {YagrReactRef} from '@gravity-ui/yagr/react';
import type {MinimalValidConfig} from '@gravity-ui/yagr';
import {useThemeType} from '@gravity-ui/uikit';
import '@gravity-ui/yagr/index.css';

const SECONDS_IN_DAY = 24 * 60 * 60;
const INTERVAL_S = 3;
const POINTS = Math.floor(SECONDS_IN_DAY / INTERVAL_S);

function generateCpuData(): {timeline: number[]; data: number[]} {
    const end = Date.now();
    const start = end - SECONDS_IN_DAY * 1000;
    const timeline: number[] = [];
    const data: number[] = [];
    for (let i = 0; i < POINTS; i++) {
        const t = start + i * INTERVAL_S * 1000;
        timeline.push(t);
        const daily = 15 * Math.sin((i / POINTS) * Math.PI * 2);
        const short = 10 * Math.sin((i / POINTS) * Math.PI * 7);
        const noise = (Math.random() - 0.5) * 8;
        data.push(Math.max(0, Math.min(100, 45 + daily + short + noise)));
    }
    return {timeline, data};
}

export function CpuMonitor() {
    const themeType = useThemeType();
    const yagrRef = useRef<YagrReactRef | null>(null);
    const dataRef = useRef(generateCpuData());

    const configRef = useRef({
        timeline: dataRef.current.timeline,
        title: {text: 'CPU Usage'},
        series: [
            {
                id: 'cpu',
                name: 'CPU',
                data: dataRef.current.data,
                type: 'area' as const,
                color: '#FF6B3D',
            },
        ],
        chart: {
            appearance: {
                theme: themeType,
            },
        },
        axes: {
            x: {side: 'bottom' as const},
            y: {
                side: 'right' as const,
                precision: 1,
            },
        },
        scales: {
            x: {time: true},
            y: {
                min: 0,
                max: 100,
            },
        },
        cursor: {
            snapToValues: false,
        },
    } satisfies MinimalValidConfig);

    useEffect(() => {
        const chart = yagrRef.current?.yagr();
        if (chart) {
            chart.setTheme(themeType);
        }
    }, [themeType]);

    useEffect(() => {
        const interval = setInterval(() => {
            const chart = yagrRef.current?.yagr();
            if (!chart) return;

            const now = Date.now();
            const newPoint = Math.max(
                0,
                Math.min(
                    100,
                    45 + 15 * Math.sin(now / 180000) + (Math.random() - 0.5) * 8,
                ),
            );

            const d = dataRef.current;
            d.timeline.push(now);
            d.data.push(newPoint);

            const cutoff = now - SECONDS_IN_DAY * 1000;
            while (d.timeline.length > 0 && d.timeline[0] < cutoff) {
                d.timeline.shift();
                d.data.shift();
            }

            chart.setSeries('cpu', {data: d.data});
        }, INTERVAL_S * 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                minHeight: 320,
            }}
        >
            <YagrReact
                id="cpu-monitor"
                config={configRef.current}
                className="cpu-monitor-chart"
                update="dynamic"
                ref={yagrRef}
            />
        </div>
    );
}

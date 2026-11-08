import {useEffect, useRef} from 'react';
import Yagr from '@gravity-ui/yagr';
import type {MinimalValidConfig} from '@gravity-ui/yagr';

import type {MonitoringSeries} from './types';

interface MonitoringChartProps {
    data: MonitoringSeries[];
    height: number;
}

function buildConfig(data: MonitoringSeries[]): MinimalValidConfig {
    const timeline = data[0]?.data.map((p) => p.timestamp) ?? [];

    return {
        timeline,
        series: data.map((s) => ({
            name: s.name,
            data: s.data.map((p) => p.value),
            color: s.color,
            type: 'line' as const,
            width: 1,
        })),
        axes: {
            x: {},
            y: {},
        },
        chart: {
            timeMultiplier: 1,
        },
        cursor: {},
    };
}

export function MonitoringChart({data, height}: MonitoringChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const yagrRef = useRef<Yagr | null>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        if (yagrRef.current) {
            yagrRef.current.dispose();
        }

        import('@gravity-ui/yagr/index.css');

        yagrRef.current = new Yagr(el, buildConfig(data));

        return () => {
            yagrRef.current?.dispose();
            yagrRef.current = null;
        };
    }, [data]);

    useEffect(() => {
        return () => {
            yagrRef.current?.dispose();
            yagrRef.current = null;
        };
    }, []);

    return (
        <div>
            <div
                ref={containerRef}
                style={{height, width: '100%'}}
            />
        </div>
    );
}

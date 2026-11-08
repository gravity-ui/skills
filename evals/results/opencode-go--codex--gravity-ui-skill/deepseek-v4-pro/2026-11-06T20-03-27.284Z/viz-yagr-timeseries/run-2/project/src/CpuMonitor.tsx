import {useEffect, useMemo, useRef} from 'react';
import {useThemeType, Card, Text} from '@gravity-ui/uikit';
import YagrReact, {type YagrReactRef} from '@gravity-ui/yagr/react';
import '@gravity-ui/yagr/index.css';

const HOURS_BACK = 24;
const INTERVAL_SEC = 3;
const POINTS = Math.floor((HOURS_BACK * 3600) / INTERVAL_SEC);
const UPDATE_MS = 2000;

interface DataBuf {
    timeline: number[];
    data: number[];
}

function generateData(): DataBuf {
    const now = Date.now();
    const timeline = new Array<number>(POINTS);
    const data = new Array<number>(POINTS);
    for (let i = 0; i < POINTS; i++) {
        const t = now - (POINTS - 1 - i) * INTERVAL_SEC * 1000;
        timeline[i] = t;
        data[i] = clampCpu(
            40 +
                20 * Math.sin(t / 600_000 + i * 0.0003) +
                12 * Math.sin(t / 180_000) +
                (Math.random() - 0.5) * 16,
        );
    }
    return {timeline, data};
}

function clampCpu(v: number) {
    return Math.max(0, Math.min(100, Math.round(v * 10) / 10));
}

function nextPoint(): number {
    const now = Date.now();
    return clampCpu(
        40 +
            20 * Math.sin(now / 600_000) +
            12 * Math.sin(now / 180_000) +
            (Math.random() - 0.5) * 16,
    );
}

export function CpuMonitor() {
    const themeType = useThemeType();
    const yagrRef = useRef<YagrReactRef | null>(null);
    const bufRef = useRef<DataBuf>(generateData());

    const yagrTheme = (themeType === 'dark' ? 'dark' : 'light') as 'light' | 'dark';

    const config = useMemo(
        () => ({
            timeline: bufRef.current.timeline,
            series: [
                {
                    id: 'cpu',
                    name: 'CPU',
                    data: bufRef.current.data,
                    type: 'area' as const,
                    color: 'var(--g-color-base-brand)',
                },
            ],
            axes: {
                x: {side: 'bottom' as const, time: true},
                y: {side: 'left' as const, label: '%', min: 0, max: 100},
            },
        }),
        [],
    );

    useEffect(() => {
        const yagr = yagrRef.current?.yagr();
        if (yagr) yagr.setTheme(yagrTheme);
    }, [yagrTheme]);

    useEffect(() => {
        const id = setInterval(() => {
            const yagr = yagrRef.current?.yagr();
            if (!yagr) return;

            const prev = bufRef.current;
            const now = Date.now();
            const val = nextPoint();

            const nextTimeline = [...prev.timeline.slice(1), now];
            const nextData = [...prev.data.slice(1), val];
            bufRef.current = {timeline: nextTimeline, data: nextData};

            yagr.setSeries(nextTimeline, [{id: 'cpu', data: nextData}], {
                incremental: true,
                splice: true,
            });
        }, UPDATE_MS);

        return () => clearInterval(id);
    }, []);

    return (
        <Card style={{height: '100%'}}>
            <div
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 'var(--g-spacing-4)',
                }}
            >
                <Text variant="subheader-2">CPU Usage — last 24 hours</Text>
                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        marginTop: 'var(--g-spacing-2)',
                    }}
                >
                    <YagrReact
                        ref={yagrRef}
                        id="cpu-monitor"
                        config={config}
                    />
                </div>
            </div>
        </Card>
    );
}

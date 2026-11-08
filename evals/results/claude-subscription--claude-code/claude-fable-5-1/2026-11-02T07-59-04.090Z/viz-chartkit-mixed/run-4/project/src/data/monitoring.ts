import type {VizDataset, VizPoint} from '../widget/types';

function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Плотный ряд мониторинга: загрузка CPU по трём узлам, шаг 10 секунд,
 * последние 24 часа — 8 640 точек на серию. Один узел уходит в пик,
 * у другого — короткий пропуск данных.
 */
export function makeMonitoringDataset(hours = 24, stepSec = 10): VizDataset {
    const rnd = mulberry32(11);
    const count = Math.floor((hours * 3600) / stepSec);
    const end = Date.UTC(2026, 10, 2, 12, 0, 0); // 2 ноября 2026, 12:00 UTC
    const start = end - count * stepSec * 1000;

    const nodes = [
        {id: 'node-a', name: 'node-a', base: 38, amp: 12, spikeAt: 0.62, gapAt: -1},
        {id: 'node-b', name: 'node-b', base: 55, amp: 8, spikeAt: -1, gapAt: 0.31},
        {id: 'node-c', name: 'node-c', base: 24, amp: 6, spikeAt: -1, gapAt: -1},
    ];

    return {
        unit: '%',
        yMin: 0,
        yMax: 100,
        timeZone: 'Europe/Moscow',
        series: nodes.map((n) => {
            let walk = 0;
            const points: VizPoint[] = [];
            for (let i = 0; i < count; i++) {
                const t = start + i * stepSec * 1000;
                const phase = i / count;
                walk = walk * 0.97 + (rnd() - 0.5) * 3;
                const daily = n.amp * Math.sin(phase * Math.PI * 2 - Math.PI / 2);
                let y = n.base + daily + walk + (rnd() - 0.5) * 4;
                if (n.spikeAt >= 0 && Math.abs(phase - n.spikeAt) < 0.02) {
                    y += 40 * (1 - Math.abs(phase - n.spikeAt) / 0.02);
                }
                if (n.gapAt >= 0 && Math.abs(phase - n.gapAt) < 0.004) {
                    points.push({t, y: null});
                    continue;
                }
                points.push({t, y: Math.round(Math.min(100, Math.max(0, y)) * 10) / 10});
            }
            return {id: n.id, name: n.name, points};
        }),
    };
}

import type {VizDataset} from '../widget/types';

/** Детерминированный генератор (без Math.random), чтобы демо было воспроизводимым. */
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

/** Продажи по каналам, помесячно за 24 месяца, в млн ₽. */
export function makeSalesDataset(months = 24): VizDataset {
    const rnd = mulberry32(7);
    const end = new Date(Date.UTC(2026, 9, 1)); // октябрь 2026
    const channels = [
        {id: 'online', name: 'Онлайн', base: 42, growth: 0.9, season: 6},
        {id: 'retail', name: 'Розница', base: 58, growth: 0.15, season: 9},
        {id: 'wholesale', name: 'Опт', base: 27, growth: 0.35, season: 3},
    ];

    return {
        unit: 'млн ₽',
        yMin: 0,
        series: channels.map((c) => ({
            id: c.id,
            name: c.name,
            points: Array.from({length: months}, (_, i) => {
                const d = new Date(end);
                d.setUTCMonth(end.getUTCMonth() - (months - 1 - i));
                const month = d.getUTCMonth();
                const seasonal = c.season * Math.sin(((month - 2) / 12) * Math.PI * 2) + (month === 11 ? c.season : 0);
                const noise = (rnd() - 0.5) * 6;
                const y = c.base + c.growth * i + seasonal + noise;
                return {t: d.getTime(), y: Math.round(y * 10) / 10};
            }),
        })),
    };
}

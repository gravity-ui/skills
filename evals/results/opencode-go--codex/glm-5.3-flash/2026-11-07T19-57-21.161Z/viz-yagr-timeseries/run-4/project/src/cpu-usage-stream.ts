export type CpuSample = {
    timestamp: number;
    value: number;
};

type CpuUsageSource = {
    subscribe: (listener: (sample: CpuSample) => void) => () => void;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const SAMPLE_INTERVAL_MS = 5_000;
const SAMPLE_COUNT = DAY_MS / SAMPLE_INTERVAL_MS;

function generateSample(previousValue: number, timestamp: number): CpuSample {
    const hour = new Date(timestamp).getUTCHours();
    const dailyLoad = 0.38 + Math.sin(((hour - 7) / 24) * Math.PI * 2) * 0.19;
    const drift = (previousValue - dailyLoad) * 0.92;
    const noise = (Math.random() - 0.5) * 0.12;

    return {
        timestamp,
        value: Math.min(1, Math.max(0, drift + dailyLoad + noise)),
    };
}

export function createCpuUsageSource(): CpuUsageSource {
    const listeners = new Set<(sample: CpuSample) => void>();
    let lastTimestamp = Date.now() - SAMPLE_INTERVAL_MS;
    let lastValue = generateSample(0.55, lastTimestamp).value;

    const timer = setInterval(() => {
        lastTimestamp += SAMPLE_INTERVAL_MS;
        lastValue = generateSample(lastValue, lastTimestamp).value;

        const sample = {timestamp: lastTimestamp, value: lastValue};
        listeners.forEach((listener) => listener(sample));
    }, SAMPLE_INTERVAL_MS);

    return {
        subscribe(listener) {
            listeners.add(listener);

            return () => {
                listeners.delete(listener);
            };
        },
    };
}

export function createHistoricalCpuData(now: number): CpuSample[] {
    const samples: CpuSample[] = [];
    const startTime = Math.floor(now / SAMPLE_INTERVAL_MS) * SAMPLE_INTERVAL_MS - DAY_MS;
    let previousValue = 0.55;

    for (let index = 0; index < SAMPLE_COUNT; index += 1) {
        const timestamp = startTime + index * SAMPLE_INTERVAL_MS;
        const sample = generateSample(previousValue, timestamp);
        samples.push(sample);
        previousValue = sample.value;
    }

    return samples;
}

export const cpuUsageSampleIntervalMs = SAMPLE_INTERVAL_MS;

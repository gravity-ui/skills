import {useEffect, useState} from 'react';

import {STEP_MS, advanceCpuLoad, generateInitialCpuLoad} from './cpuLoad';
import type {CpuLoadData} from './cpuLoad';

/**
 * Поток «реального времени»: раз в секунду дополняет ряд свежей точкой.
 * Интервал корректно снимается при размонтировании.
 */
export function useCpuLoad(): CpuLoadData {
    const [data, setData] = useState<CpuLoadData>(() => generateInitialCpuLoad());

    useEffect(() => {
        const timer = window.setInterval(() => {
            setData((prev) => advanceCpuLoad(prev));
        }, STEP_MS);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    return data;
}

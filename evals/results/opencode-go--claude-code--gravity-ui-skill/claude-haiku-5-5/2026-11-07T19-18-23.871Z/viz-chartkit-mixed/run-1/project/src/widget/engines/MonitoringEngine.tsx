import {useId, useMemo} from 'react';
import Yagr from '@gravity-ui/yagr/react';

// Стили yagr подключаются только вместе с этим движком (ленивый чанк).
import '@gravity-ui/yagr/index.css';

import {toYagrConfig} from '../adapters';
import type {EngineProps} from '../types';

// Этот модуль загружается лениво (React.lazy) только при режиме «Мониторинг».
export default function MonitoringEngine({series, colors, themeType}: EngineProps) {
    const id = useId();
    const config = useMemo(() => toYagrConfig(series, colors, themeType), [series, colors, themeType]);
    return (
        <div style={{height: '100%'}}>
            <Yagr id={id} config={config} update="dynamic" />
        </div>
    );
}

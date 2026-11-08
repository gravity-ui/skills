import {settings} from '@gravity-ui/chartkit';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

import type {VizEngine} from '../types';
import {toYagrData} from './monitoringAdapter';

// Регистрация происходит при первой загрузке модуля — то есть лениво, вместе с кодом движка.
settings.set({plugins: [YagrPlugin]});

export const monitoringEngine: VizEngine<'yagr'> = {
    mode: 'monitoring',
    chartKitType: 'yagr',
    library: '@gravity-ui/yagr',
    buildProps(dataset, ctx) {
        return {type: 'yagr', data: toYagrData(dataset, ctx)};
    },
};

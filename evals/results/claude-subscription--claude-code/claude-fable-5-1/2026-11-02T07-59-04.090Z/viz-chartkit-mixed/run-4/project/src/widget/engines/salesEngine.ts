import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {settings as dateSettings} from '@gravity-ui/date-utils';

import type {VizEngine} from '../types';
import {toGravityChartsData} from './salesAdapter';

// Регистрация происходит при первой загрузке модуля — то есть лениво, вместе с кодом движка.
settings.set({plugins: [GravityChartsPlugin]});

export const salesEngine: VizEngine<'gravity-charts'> = {
    mode: 'sales',
    chartKitType: 'gravity-charts',
    library: '@gravity-ui/charts',
    // Подписи дат Gravity Charts форматирует через date-utils: локаль подгружаем
    // здесь, а не в точке входа, чтобы dayjs и словарь локали не попали в основной бандл.
    async prepare() {
        const lang = settings.get('lang');
        if (dateSettings.getLocale() === lang) {
            return;
        }
        try {
            await dateSettings.loadLocale(lang);
            dateSettings.setLocale(lang);
        } catch {
            // Нет словаря локали — остаёмся на английских подписях, график всё равно рисуем.
        }
    },
    buildProps(dataset, ctx) {
        return {type: 'gravity-charts', data: toGravityChartsData(dataset, ctx)};
    },
};

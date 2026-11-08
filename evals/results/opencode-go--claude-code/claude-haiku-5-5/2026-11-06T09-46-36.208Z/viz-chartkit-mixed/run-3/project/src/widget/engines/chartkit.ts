import {settings} from '@gravity-ui/chartkit';
import type {ChartKitPlugin} from '@gravity-ui/chartkit';

/**
 * ChartKit читает плагины из глобальных настроек при рендере.
 * Каждый движок регистрирует свой плагин в момент загрузки своего модуля.
 * Поэтому код плагина попадает в браузер только тогда, когда режим открыт.
 */
export function registerChartkitPlugin(plugin: ChartKitPlugin): void {
  settings.set({lang: 'ru', plugins: [plugin]});
}

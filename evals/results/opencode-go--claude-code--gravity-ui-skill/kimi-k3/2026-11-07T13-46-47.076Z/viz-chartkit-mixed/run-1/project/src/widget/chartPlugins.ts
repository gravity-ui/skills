import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

/**
 * Регистрация движков в глобальном реестре ChartKit.
 *
 * Сами модули плагинов крошечные: внутри каждого renderer обёрнут в
 * `React.lazy(() => import('./renderer/...'))`, поэтому код движков
 * (@gravity-ui/charts / @gravity-ui/yagr + uplot) запрашивается отдельным
 * чанком только при первом рендере соответствующего режима.
 *
 * Модуль импортируется виджетом для side effect — потребителю `VizWidget`
 * не нужно помнить про регистрацию, но она гарантированно выполняется
 * до первого рендера `<ChartKit>`.
 */
let registered = false;

export function registerChartEngines(): void {
  if (registered) {
    return;
  }
  settings.set({lang: 'ru', plugins: [GravityChartsPlugin, YagrPlugin]});
  registered = true;
}

registerChartEngines();

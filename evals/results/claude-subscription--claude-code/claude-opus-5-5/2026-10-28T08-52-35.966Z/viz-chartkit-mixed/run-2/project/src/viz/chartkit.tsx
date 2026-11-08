// ChartKit keeps a global plugin registry; importing this module fills it once.
// Each plugin's renderer is `React.lazy`, so neither @gravity-ui/charts nor yagr
// is downloaded until a chart of that type is rendered for the first time.
import React from 'react';
import ChartKit, {settings, type ChartKitPlugin} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

const LANG = 'ru';

// Engines format dates through @gravity-ui/date-utils, whose dayjs locale is separate
// from ChartKit's `lang` (without it yagr tooltips read "27 October 2026").
// Loaded on first chart render, together with the engine, not on app start.
let dateLocaleReady: Promise<void> | undefined;
function loadDateLocale() {
    dateLocaleReady ??= import('@gravity-ui/date-utils').then(async ({settings: dateSettings}) => {
        await dateSettings.loadLocale(LANG);
        dateSettings.setLocale(LANG);
    });
    return dateLocaleReady;
}

// Holds the plugin's lazy renderer back until the date locale is ready, so the
// first frame is already localized.
function withDateLocale(plugin: ChartKitPlugin): ChartKitPlugin {
    const Renderer = plugin.renderer;
    const LocalizedRenderer = React.forwardRef<unknown, object>(function LocalizedRenderer(props, ref) {
        return <Renderer ref={ref} {...props} />;
    });
    return {
        ...plugin,
        renderer: React.lazy(() => loadDateLocale().then(() => ({default: LocalizedRenderer}))),
    };
}

settings.set({
    lang: LANG,
    plugins: [withDateLocale(GravityChartsPlugin), withDateLocale(YagrPlugin)],
});

export {ChartKit};

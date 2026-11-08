// Global DashKit configuration. It must run before the first <DashKit> render,
// so App.tsx imports this module for its side effects.
import {DashKit, pluginTitle} from '@gravity-ui/dashkit';
import {configure, Lang} from '@gravity-ui/uikit';

import {WIDGET_PLUGINS} from './widgets';

configure({lang: Lang.Ru});

DashKit.setSettings({
    gridLayout: {margin: [12, 12]},
});

DashKit.registerPlugins(pluginTitle, ...WIDGET_PLUGINS);

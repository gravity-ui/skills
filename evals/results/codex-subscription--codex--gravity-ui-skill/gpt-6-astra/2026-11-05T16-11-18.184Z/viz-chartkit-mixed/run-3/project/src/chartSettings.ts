import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

// Both registry entries use React.lazy internally; engines load on first use.
settings.set({plugins: [GravityChartsPlugin, YagrPlugin], lang: 'ru'});

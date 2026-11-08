// Глобальная настройка DashKit должна выполниться до первого рендера <DashKit>.
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {configure, Lang} from '@gravity-ui/uikit';
import {DashKit, pluginTitle} from '@gravity-ui/dashkit';

import {listPlugin, metricPlugin, progressPlugin} from './widgets';

configure({lang: Lang.Ru});

// Сетка DashKit: 36 колонок, высота строки 18px (значения по умолчанию).
DashKit.setSettings({gridLayout: {margin: [8, 8]}});

// reloadPlugins вместо registerPlugins: registerPlugins бросает ошибку при повторной
// регистрации того же типа, а модуль переисполняется при HMR в dev-режиме.
DashKit.reloadPlugins(pluginTitle, metricPlugin, progressPlugin, listPlugin);

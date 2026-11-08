import * as React from 'react';
import {Flex, Text} from '@gravity-ui/uikit';

import {VisualizationWidget} from './viz/VisualizationWidget';
import {createDemoViews} from './viz/mockData';
import type {VisualizationMode} from './viz/types';
import './App.css';

export function App() {
    const views = React.useMemo(createDemoViews, []);
    const [mode, setMode] = React.useState<VisualizationMode>('sales');

    const description =
        mode === 'sales'
            ? 'Помесячная выручка, сравнение с прошлым годом'
            : `CPU по хостам, шаг 10 с — ${views.monitoring.data.timeline.length.toLocaleString('ru-RU')} точек на серию. Выделите область, чтобы приблизить.`;

    return (
        <Flex direction="column" gap={5} className="app">
            <Text variant="header-1">Визуализация</Text>
            <VisualizationWidget
                title={mode === 'sales' ? 'Продажи' : 'Мониторинг инфраструктуры'}
                description={description}
                views={views}
                mode={mode}
                onModeChange={setMode}
                height={380}
            />
        </Flex>
    );
}

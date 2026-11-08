import React from 'react';

import {buildDemoDatasets} from './demoData';
import {VisualizationWidget} from './visualization/VisualizationWidget';

export function App() {
    const datasets = React.useMemo(() => buildDemoDatasets(), []);

    return (
        <div style={{padding: 'var(--g-spacing-6)', maxWidth: 1200, margin: '0 auto'}}>
            <VisualizationWidget
                title="Продажи и мониторинг сервиса"
                datasets={datasets}
                defaultMode="sales"
                onError={(error, mode) => console.error(`[viz:${mode}]`, error)}
            />
        </div>
    );
}

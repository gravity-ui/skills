import React from 'react';

import {VisualizationWidget} from './VisualizationWidget';

export function App() {
    const [mode, setMode] = React.useState<'sales' | 'monitoring'>('sales');

    return (
        <div className="app">
            <VisualizationWidget mode={mode} onModeChange={setMode} />
        </div>
    );
}

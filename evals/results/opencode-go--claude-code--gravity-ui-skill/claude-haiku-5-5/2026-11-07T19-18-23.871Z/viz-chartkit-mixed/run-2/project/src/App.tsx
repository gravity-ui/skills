import {demoWidgetData} from './demo/data';
import {VisualizationWidget} from './widget';

export function App() {
    return (
        <div style={{padding: 24, maxWidth: 1200, margin: '0 auto'}}>
            <VisualizationWidget title="Продажи и мониторинг" data={demoWidgetData} defaultMode="sales" />
        </div>
    );
}

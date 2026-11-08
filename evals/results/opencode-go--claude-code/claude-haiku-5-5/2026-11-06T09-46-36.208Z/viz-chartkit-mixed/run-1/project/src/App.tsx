import {ChartWidget} from './chart-widget';
import {SAMPLE_DATASETS} from './demo/sample-data';

export function App() {
    return (
        <main style={{padding: 24, maxWidth: 1040}}>
            <ChartWidget title="Динамика" datasets={SAMPLE_DATASETS} />
        </main>
    );
}

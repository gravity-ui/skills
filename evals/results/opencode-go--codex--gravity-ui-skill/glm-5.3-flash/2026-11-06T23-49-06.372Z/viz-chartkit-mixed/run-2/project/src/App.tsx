import {VisualizationWidget} from './visualization-widget/VisualizationWidget';

export function App() {
    const now = Date.now();
    const timeline = Array.from({length: 720}, (_, index) => now - (720 - index) * 1000);

    return (
        <VisualizationWidget
            data={{
                mode: 'sales',
                sales: {
                    series: [
                        {
                            name: 'Продажи',
                            data: Array.from({length: 30}, (_, index) => ({
                                x: now - (29 - index) * 24 * 60 * 60 * 1000,
                                y: 1200 + Math.sin(index / 4) * 320 + index * 18,
                            })),
                        },
                    ],
                },
                monitoring: {
                    timeline,
                    series: [
                        {
                            name: 'CPU',
                            color: 'var(--g-color-base-brand)',
                            data: timeline.map((_, index) => 42 + Math.sin(index / 9) * 18),
                        },
                        {
                            name: 'Latency',
                            color: 'var(--g-color-base-positive-hover)',
                            data: timeline.map((_, index) => 18 + Math.cos(index / 17) * 9),
                        },
                    ],
                },
            }}
        />
    );
}

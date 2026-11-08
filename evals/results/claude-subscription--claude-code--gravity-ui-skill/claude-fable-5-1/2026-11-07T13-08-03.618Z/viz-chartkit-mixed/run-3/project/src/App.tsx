import {Container} from '@gravity-ui/uikit';

import {demoData} from './demo-data';
import {VizWidget} from './viz-widget';

export function App() {
    return (
        <Container maxWidth="l" spaceRow={6}>
            <VizWidget title="Продажи и мониторинг" data={demoData} defaultMode="sales" height={360} />
        </Container>
    );
}

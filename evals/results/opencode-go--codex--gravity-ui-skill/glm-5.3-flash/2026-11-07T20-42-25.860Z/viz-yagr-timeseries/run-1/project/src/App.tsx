// Implement the requested feature here (and may add sibling files).
import {Col, Container, Row} from '@gravity-ui/uikit';

import {CpuUsageChart} from './CpuUsageChart';

export function App() {
    return (
        <Container maxWidth="l" className="monitoring-page">
            <Row>
                <Col>
                    <h1 className="monitoring-title">Мониторинг</h1>
                </Col>
            </Row>
            <Row>
                <Col s={12} l={12}>
                    <CpuUsageChart />
                </Col>
            </Row>
        </Container>
    );
}

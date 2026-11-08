import { Container, Row, Col } from '@gravity-ui/uikit';

import { Dashboard } from './dashboard';

export function App() {
  return (
    <Container>
      <Row>
        <Col>
          <Dashboard />
        </Col>
      </Row>
    </Container>
  );
}

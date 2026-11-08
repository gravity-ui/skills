import {Card, Flex} from '@gravity-ui/uikit';

import {DataVisualizer} from './DataVisualizer';

export function App() {
  return (
    <Flex justifyContent="center" style={{padding: 24, minHeight: '100dvh'}}>
      <Card view="outlined" width="100%" style={{maxWidth: 1400, padding: 20}}>
        <DataVisualizer />
      </Card>
    </Flex>
  );
}

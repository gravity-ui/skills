import { Card, Text } from '@gravity-ui/uikit';
import type { TextProps } from './types';

export function TextWidget({ body }: TextProps) {
  return (
    <Card view="raised" style={{ padding: 16, height: '100%' }}>
      <Text variant="body-1" style={{ whiteSpace: 'pre-wrap' }}>
        {body}
      </Text>
    </Card>
  );
}

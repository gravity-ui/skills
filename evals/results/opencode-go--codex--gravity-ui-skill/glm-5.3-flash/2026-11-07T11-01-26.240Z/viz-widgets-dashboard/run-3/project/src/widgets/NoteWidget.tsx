import {Card, Flex, Text} from '@gravity-ui/uikit';

import type {NoteWidgetData} from './types';
import styles from './NoteWidget.module.css';

export function NoteWidget({data}: {data: NoteWidgetData}) {
  return (
    <Card className={styles.card} view="clear">
      <Flex direction="column" gap={2} height="100%">
        <Text variant="subheader-2">{data.title}</Text>
        <Text className={styles.content} variant="body-2">
          {data.content}
        </Text>
      </Flex>
    </Card>
  );
}

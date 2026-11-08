import {Card, Flex, Progress, Text} from '@gravity-ui/uikit';

import type {MetricWidgetData} from './types';
import styles from './MetricWidget.module.css';

export function MetricWidget({data}: {data: MetricWidgetData}) {
  return (
    <Card className={styles.card} view="clear">
      <Flex direction="column" gap={3} height="100%">
        <Text className={styles.label} variant="body-2">
          {data.label}
        </Text>
        <Text className={styles.value} variant="header-2">
          {data.value}
        </Text>
        {data.caption ? (
          <Text className={styles.caption} variant="caption-1">
            {data.caption}
          </Text>
        ) : null}
        <div className={styles.progress}>
          <Progress
            size="s"
            theme="info"
            value={Math.min(100, Math.max(0, data.progress))}
          />
        </div>
      </Flex>
    </Card>
  );
}

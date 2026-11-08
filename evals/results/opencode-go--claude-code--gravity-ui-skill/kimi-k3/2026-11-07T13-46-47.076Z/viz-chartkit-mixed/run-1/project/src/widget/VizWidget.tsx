import React from 'react';

import ChartKit from '@gravity-ui/chartkit';
import {Loader, Text} from '@gravity-ui/uikit';

import {toGravityChartsData, toYagrData} from './adapters';
import type {VizWidgetProps} from './types';

import './chartPlugins';

/**
 * Единый виджет визуализации.
 *
 * Оба режима (`sales` и `monitoring`) обслуживаются одним API:
 * потребитель выбирает `mode` и передаёт данные в едином формате,
 * а виджет сам диспетчеризует их в нужный движок через ChartKit.
 * Движки подгружаются лениво: чанк @gravity-ui/charts тянется только
 * при первом показе режима `sales`, чанк @gravity-ui/yagr — режима
 * `monitoring` (React.lazy внутри плагинов ChartKit + Suspense-лоадер).
 */
export function VizWidget(props: VizWidgetProps) {
  const {title, height = 360} = props;
  const generatedId = React.useId();
  const id = props.id ?? `viz-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const chart = React.useMemo(() => {
    if (props.mode === 'sales') {
      return (
        <ChartKit
          key="sales"
          type="gravity-charts"
          data={toGravityChartsData(props.data)}
          renderPluginLoader={renderLoader}
        />
      );
    }
    return (
      <ChartKit
        key="monitoring"
        type="yagr"
        id={id}
        data={toYagrData(props.data)}
        renderPluginLoader={renderLoader}
      />
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.mode, props.data, id]);

  return (
    <section>
      {title ? (
        <Text variant="subheader-2" as="h3">
          {title}
        </Text>
      ) : null}
      {/* ChartKit заполняет родителя — явная высота контейнера обязательна */}
      <div style={{height, marginBlockStart: 'var(--g-spacing-2)'}}>{chart}</div>
    </section>
  );
}

function renderLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <Loader size="m" />
    </div>
  );
}

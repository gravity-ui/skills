import {useCallback, useEffect, useState} from 'react';
import {
  ActionPanel,
  DashKit,
  DashKitDnDWrapper,
  pluginTitle,
} from '@gravity-ui/dashkit';
import type {ActionPanelItem, DashKitProps} from '@gravity-ui/dashkit';
import {ChartColumn, CircleCheck, ListUl, Pencil, Check, TextAlignLeft} from '@gravity-ui/icons';
import {Button, Flex, Icon, Lang, Text, configure} from '@gravity-ui/uikit';

import {clearState, loadState, saveState} from './config';
import type {DashboardState} from './config';
import {
  DEFAULT_DATA,
  WIDGET_TYPES,
  activityPlugin,
  kpiPlugin,
  progressPlugin,
  tasksPlugin,
} from './widgets';
import './App.css';

configure({lang: Lang.Ru});

DashKit.setSettings({gridLayout: {margin: [12, 12]}});
DashKit.registerPlugins(pluginTitle, kpiPlugin, progressPlugin, tasksPlugin, activityPlugin);

const PANEL_ITEMS: ActionPanelItem[] = [
  {id: 'title', title: 'Заголовок', icon: <Icon data={TextAlignLeft} size={16} />, dragProps: {type: 'title'}},
  {id: 'kpi', title: 'Метрика', icon: <Icon data={ChartColumn} size={16} />, dragProps: {type: WIDGET_TYPES.kpi}},
  {id: 'progress', title: 'Прогресс', icon: <Icon data={ListUl} size={16} />, dragProps: {type: WIDGET_TYPES.progress}},
  {id: 'tasks', title: 'Задачи', icon: <Icon data={CircleCheck} size={16} />, dragProps: {type: WIDGET_TYPES.tasks}},
  {id: 'activity', title: 'Лента', icon: <Icon data={ListUl} size={16} />, dragProps: {type: WIDGET_TYPES.activity}},
];

export function App() {
  const [state, setState] = useState<DashboardState>(loadState);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => saveState(state), [state]);

  const onChange = useCallback<NonNullable<DashKitProps['onChange']>>(
    ({config, itemsStateAndParams}) => {
      setState({config, itemsStateAndParams});
    },
    [],
  );

  const onDrop = useCallback<NonNullable<DashKitProps['onDrop']>>((dropProps) => {
    const {type} = dropProps.dragProps;
    setState((prev) => ({
      ...prev,
      config: DashKit.setItem({
        item: {
          type,
          data: DEFAULT_DATA[type] ?? {},
          layout: {
            x: dropProps.itemLayout.x,
            y: dropProps.itemLayout.y,
            w: dropProps.itemLayout.w,
            h: dropProps.itemLayout.h,
          },
        },
        config: prev.config,
        options: {updateLayout: dropProps.newLayout},
      }),
    }));
    dropProps.commit();
  }, []);

  const reset = () => {
    clearState();
    setState(loadState());
  };

  return (
    <Flex direction="column" className="dashboard">
      <Flex alignItems="center" gap={3} className="dashboard__header">
        <Text variant="header-2" style={{flex: 1, minWidth: 0}} ellipsis>
          Дашборд
        </Text>
        {editMode && (
          <Button view="outlined" onClick={reset}>
            Сбросить
          </Button>
        )}
        <Button
          view={editMode ? 'action' : 'normal'}
          style={{flexShrink: 0}}
          onClick={() => setEditMode((v) => !v)}
        >
          <Icon data={editMode ? Check : Pencil} size={16} />
          {editMode ? 'Готово' : 'Редактировать'}
        </Button>
      </Flex>

      <div className="dashboard__body">
        <DashKitDnDWrapper>
          <>
            <DashKit
              config={state.config}
              itemsStateAndParams={state.itemsStateAndParams}
              editMode={editMode}
              onChange={onChange}
              onDrop={onDrop}
            />
            {editMode && <ActionPanel items={PANEL_ITEMS} />}
          </>
        </DashKitDnDWrapper>
      </div>
    </Flex>
  );
}

import {useState} from 'react';
import {Button, DropdownMenu, Flex, Icon, Text, sp} from '@gravity-ui/uikit';
import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {ChevronDown, Copy, Pencil, Plus, TrashBin} from '@gravity-ui/icons';

export function App() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const items: DropdownMenuItem[] = [
    {
      iconStart: <Icon data={Plus} size={16} />,
      text: 'Создать',
      action: () => setLastAction('Создать'),
    },
    {
      iconStart: <Icon data={Pencil} size={16} />,
      text: 'Редактировать',
      action: () => setLastAction('Редактировать'),
    },
    {
      iconStart: <Icon data={Copy} size={16} />,
      text: 'Дублировать',
      action: () => setLastAction('Дублировать'),
    },
    {
      iconStart: <Icon data={TrashBin} size={16} />,
      text: 'Удалить',
      theme: 'danger',
      action: () => setLastAction('Удалить'),
    },
  ];

  return (
    <Flex direction="column" alignItems="flex-start" gap={4} className={sp({p: 6})}>
      <DropdownMenu
        items={items}
        size="l"
        renderSwitcher={(props) => (
          <Button {...props} view="normal" size="l">
            Действия
            <Icon data={ChevronDown} size={16} />
          </Button>
        )}
      />
      <Text variant="body-1" color="secondary">
        {lastAction ? `Выбрано действие: ${lastAction}` : 'Нажмите кнопку, чтобы открыть список действий'}
      </Text>
    </Flex>
  );
}

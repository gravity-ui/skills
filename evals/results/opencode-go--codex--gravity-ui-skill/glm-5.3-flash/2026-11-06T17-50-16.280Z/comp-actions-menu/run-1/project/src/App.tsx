import { Button, DropdownMenu } from '@gravity-ui/uikit';

export function App() {

  return (
    <div style={{ padding: 24 }}>
      <DropdownMenu
        size="m"
        items={[
          [
            { text: 'Открыть', action: () => {} },
            { text: 'Дублировать', action: () => {} },
            { text: 'Удалить', action: () => {} },
          ],
        ]}
        renderSwitcher={(props) => (
          <Button {...props} view="normal" size="m">
            Действия
          </Button>
        )}
      />
    </div>
  );
}

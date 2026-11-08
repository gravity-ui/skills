import {useState} from 'react';
import {ConfirmDialog} from '@gravity-ui/components';
import {Button} from '@gravity-ui/uikit';

export function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const closeDialog = () => setIsDialogOpen(false);

  return (
    <main
      style={{
        alignItems: 'center',
        background: 'var(--g-color-base-background)',
        color: 'var(--g-color-text-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <Button
        view="action"
        size="l"
        onClick={() => {
          setResult(null);
          setIsDialogOpen(true);
        }}
      >
        Открыть окно
      </Button>
      {result && <div role="status">{result}</div>}

      <ConfirmDialog
        open={isDialogOpen}
        title="Подтвердите действие"
        message="Вы уверены, что хотите продолжить?"
        textButtonApply="Подтвердить"
        textButtonCancel="Отменить"
        onClose={closeDialog}
        onClickButtonApply={() => {
          setResult('Действие подтверждено.');
          closeDialog();
        }}
        onClickButtonCancel={() => {
          setResult('Действие отменено.');
          closeDialog();
        }}
      />
    </main>
  );
}

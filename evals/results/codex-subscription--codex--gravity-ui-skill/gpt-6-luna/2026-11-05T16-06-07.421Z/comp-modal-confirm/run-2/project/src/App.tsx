import {useState} from 'react';
import {Button, Dialog, Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleConfirm = () => {
    setIsDialogOpen(false);
    setResult('Вы подтвердили действие.');
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setResult('Действие отменено.');
  };

  return (
    <main className="app">
      <section className="app__content" aria-labelledby="page-title">
        <Text as="h1" id="page-title" variant="header-2">
          Подтверждение действия
        </Text>
        <Text as="p" className="app__description" variant="body-2">
          Нажмите кнопку, чтобы открыть окно подтверждения.
        </Text>
        <Button view="action" size="l" onClick={() => {
          setResult(null);
          setIsDialogOpen(true);
        }}>
          Открыть окно
        </Button>
        {result && (
          <Text className="app__result" role="status" variant="body-1">
            {result}
          </Text>
        )}
      </section>

      <Dialog
        open={isDialogOpen}
        onClose={handleCancel}
        onOpenChange={(open) => setIsDialogOpen(open)}
        aria-labelledby="confirmation-title"
        initialFocus="cancel"
        size="s"
      >
        <Dialog.Header caption="Подтвердите действие" id="confirmation-title" />
        <Dialog.Body>
          <Text as="p" variant="body-2">
            Вы уверены, что хотите продолжить?
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonApply="Подтвердить"
          textButtonCancel="Отменить"
          onClickButtonApply={handleConfirm}
          onClickButtonCancel={handleCancel}
        />
      </Dialog>
    </main>
  );
}

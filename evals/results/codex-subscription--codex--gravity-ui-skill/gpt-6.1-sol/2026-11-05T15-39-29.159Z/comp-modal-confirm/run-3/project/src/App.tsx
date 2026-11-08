import {useId, useState} from 'react';
import {Button, Dialog, Flex, Label, Text} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const titleId = useId();
  const descriptionId = useId();

  const openDialog = () => {
    setConfirmed(false);
    setOpen(true);
  };

  const confirm = () => {
    setConfirmed(true);
    setOpen(false);
  };

  return (
    <div className="app">
      <header className="page-header">
        <Flex alignItems="center" gap={3}>
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <Text variant="subheader-3">gravity<span className="brand-ui"> ui</span></Text>
          <span className="header-divider" aria-hidden="true" />
          <Text variant="body-1" color="secondary">Маленькие взаимодействия</Text>
        </Flex>
        <Label theme="normal" size="s" className="header-label">Сделано с Gravity UI</Label>
      </header>

      <main className="main">
        <Flex direction="column" alignItems="center" gap={5} className="intro">
          <Text variant="caption-2" className="eyebrow">ПРОСТО И ПОНЯТНО</Text>
          <Text as="h1" variant="display-3" className="page-title">
            Важные действия —<br />с вашего согласия.
          </Text>
          <Text as="p" variant="body-3" color="secondary" className="intro-description">
            Небольшая пауза, чтобы принять решение.<br />
            Откройте диалог и выберите, как продолжить.
          </Text>
        </Flex>

        <section className="demo-card" aria-label="Пример модального окна">
          <Flex alignItems="center" justifyContent="space-between" className="card-header">
            <Text variant="body-1" color="secondary">Модальное окно</Text>
            <Flex alignItems="center" gap={2}>
              <span className="live-dot" aria-hidden="true" />
              <Text variant="caption-2" color="secondary">Интерактивный пример</Text>
            </Flex>
          </Flex>

          <Flex direction="column" alignItems="center" className="card-content">
            <div className="window-illustration" aria-hidden="true">
              <div className="mini-window">
                <div className="mini-toolbar"><i /><i /><i /></div>
                <div className="mini-content">
                  <span className="mini-title" />
                  <span className="mini-line" />
                  <span className="mini-line short" />
                  <div className="mini-actions"><span /><span /></div>
                </div>
              </div>
              <span className="illustration-spark">✦</span>
            </div>

            <Text as="h2" variant="header-2" className="card-title">Решение за вами</Text>
            <Text as="p" variant="body-2" color="secondary" className="card-description">
              Одно нажатие — и перед вами диалог<br />
              с подтверждением и отменой.
            </Text>
            <Button view="action" size="xl" onClick={openDialog} className="open-button">
              Открыть модальное окно <span className="button-arrow" aria-hidden="true">↗</span>
            </Button>
            <div className="result" role="status" aria-live="polite">
              {confirmed ? (
                <Text variant="body-1" color="positive">✓ Действие успешно подтверждено</Text>
              ) : (
                <Text variant="body-1" color="hint">Попробуйте — это всего лишь пример</Text>
              )}
            </div>
          </Flex>
          <Flex alignItems="center" justifyContent="center" gap={2} className="card-footer">
            <span className="keyboard-key">Esc</span>
            <Text variant="caption-2" color="secondary">или клик вне окна, чтобы закрыть диалог</Text>
          </Flex>
        </section>

        <div className="steps">
          {[
            ['01', 'Откройте', 'Нажмите на кнопку'],
            ['02', 'Выберите', 'Подтвердите или отмените'],
            ['03', 'Продолжайте', 'Всё под вашим контролем'],
          ].map(([number, title, description]) => (
            <Flex gap={3} key={number} className="step">
              <Text variant="caption-2" className="step-number">{number}</Text>
              <Flex direction="column" gap={1} className="step-copy">
                <Text variant="subheader-1">{title}</Text>
                <Text variant="caption-2" color="secondary">{description}</Text>
              </Flex>
            </Flex>
          ))}
        </div>
      </main>

      <footer className="page-footer">
        <Text variant="caption-2" color="secondary">Хороший интерфейс оставляет выбор за вами.</Text>
        <Text variant="caption-2" color="hint">Компоненты / Обратная связь</Text>
      </footer>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="s"
        initialFocus="cancel"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="confirmation-dialog"
      >
        <Dialog.Header caption="Подтвердить действие?" id={titleId} />
        <Dialog.Body>
          <Text as="p" variant="body-2" color="secondary" id={descriptionId} className="dialog-description">
            Вы уверены, что хотите продолжить? Нажмите «Подтвердить», чтобы выполнить действие, или «Отменить», чтобы вернуться назад.
          </Text>
        </Dialog.Body>
        <Dialog.Footer
          textButtonCancel="Отменить"
          textButtonApply="Подтвердить"
          onClickButtonCancel={() => setOpen(false)}
          onClickButtonApply={confirm}
          propsButtonCancel={{view: 'normal'}}
        />
      </Dialog>
    </div>
  );
}

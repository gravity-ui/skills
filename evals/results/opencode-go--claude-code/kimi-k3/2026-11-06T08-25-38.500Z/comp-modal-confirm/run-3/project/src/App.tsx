import {useState} from 'react';
import {Button, Dialog, Text} from '@gravity-ui/uikit';

export function App() {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleConfirm = () => {
        setOpen(false);
        setResult('Действие подтверждено.');
    };

    const handleCancel = () => {
        setOpen(false);
        setResult('Действие отменено.');
    };

    return (
        <div style={{padding: 24, display: 'flex', flexDirection: 'column', gap: 16}}>
            <div>
                <Button view="action" size="l" onClick={() => setOpen(true)}>
                    Открыть модальное окно
                </Button>
            </div>

            {result && <Text color="secondary">{result}</Text>}

            <Dialog open={open} onClose={handleCancel} size="s">
                <Dialog.Header caption="Подтверждение действия" />
                <Dialog.Body>
                    <Text>Вы уверены, что хотите выполнить это действие?</Text>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonApply={handleConfirm}
                    onClickButtonCancel={handleCancel}
                    textButtonApply="Подтвердить"
                    textButtonCancel="Отмена"
                />
            </Dialog>
        </div>
    );
}

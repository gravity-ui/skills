import {useState} from 'react';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import {ConfirmDialog} from '@gravity-ui/components';

type Decision = 'confirmed' | 'cancelled' | null;

export function App() {
    const [open, setOpen] = useState(false);
    const [decision, setDecision] = useState<Decision>(null);

    const handleConfirm = () => {
        setDecision('confirmed');
        setOpen(false);
    };

    const handleCancel = () => {
        setDecision('cancelled');
        setOpen(false);
    };

    return (
        <Flex direction="column" alignItems="flex-start" gap={3} style={{padding: 24}}>
            <Button view="action" size="l" onClick={() => setOpen(true)}>
                Открыть окно
            </Button>

            {decision && (
                <Text color="secondary">
                    {decision === 'confirmed' ? 'Действие подтверждено' : 'Действие отменено'}
                </Text>
            )}

            <ConfirmDialog
                open={open}
                size="s"
                title="Подтвердите действие"
                message="Вы уверены, что хотите продолжить? Это действие нельзя будет отменить."
                textButtonApply="Подтвердить"
                textButtonCancel="Отменить"
                onClickButtonApply={handleConfirm}
                onClickButtonCancel={handleCancel}
                onClose={handleCancel}
            />
        </Flex>
    );
}

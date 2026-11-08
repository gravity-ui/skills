import {useRef} from 'react';
import {Button, Toaster, ToasterComponent, ToasterProvider, useToaster} from '@gravity-ui/uikit';

const toaster = new Toaster();

function CornerButton() {
    const {add} = useToaster();
    const counterRef = useRef(0);

    const showToast = () => {
        counterRef.current += 1;
        add({
            name: `corner-toast-${counterRef.current}`,
            title: 'Уведомление',
            content: 'Кнопка нажата. Это сообщение исчезнет само через 5 секунд.',
            theme: 'success',
            autoHiding: 5000,
        });
    };

    return (
        <Button
            view="action"
            size="l"
            style={{
                position: 'fixed',
                right: 'var(--g-spacing-6)',
                bottom: 'var(--g-spacing-6)',
            }}
            onClick={showToast}
        >
            Показать уведомление
        </Button>
    );
}

export function App() {
    return (
        <ToasterProvider toaster={toaster}>
            <CornerButton />
            <ToasterComponent />
        </ToasterProvider>
    );
}

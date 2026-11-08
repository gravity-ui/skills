import * as React from 'react';
import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';

const toaster = new Toaster();

const AUTO_HIDE_MS = 3000;

function NotifyButton() {
    const { add } = useToaster();
    const counter = React.useRef(0);

    const handleClick = () => {
        counter.current += 1;
        add({
            name: `notification-${counter.current}`,
            title: 'Уведомление',
            content: 'Это уведомление закроется само через несколько секунд.',
            theme: 'info',
            autoHiding: AUTO_HIDE_MS,
        });
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 'var(--g-spacing-4)',
                right: 'var(--g-spacing-4)',
            }}
        >
            <Button view="action" size="l" onClick={handleClick}>
                Показать уведомление
            </Button>
        </div>
    );
}

export function App() {
    return (
        <ToasterProvider toaster={toaster}>
            <NotifyButton />
            <ToasterComponent />
        </ToasterProvider>
    );
}

import { Button, Toaster, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';
import { useRef } from 'react';

// One Toaster instance for the whole app. The ToasterComponent renders toasts
// in a portal, fixed to the bottom-right corner of the viewport.
const toaster = new Toaster();

const AUTO_HIDE_MS = 4000;

function NotifyButton() {
    const { add } = useToaster();
    const counter = useRef(0);

    const handleClick = () => {
        counter.current += 1;
        add({
            // Unique name so repeated clicks stack new toasts instead of replacing one.
            name: `notification-${counter.current}`,
            title: 'Уведомление',
            content: 'Это всплывающее уведомление скоро исчезнет само.',
            theme: 'info',
            autoHiding: AUTO_HIDE_MS,
        });
    };

    return (
        <div
            style={{
                position: 'fixed',
                insetBlockStart: 'var(--g-spacing-4)',
                insetInlineEnd: 'var(--g-spacing-4)',
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

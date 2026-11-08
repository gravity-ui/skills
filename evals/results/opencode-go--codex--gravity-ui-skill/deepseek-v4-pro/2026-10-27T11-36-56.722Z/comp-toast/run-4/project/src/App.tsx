import { Button, ToasterComponent, ToasterProvider, useToaster } from '@gravity-ui/uikit';
import { toaster } from '@gravity-ui/uikit/toaster-singleton';

function ShowToastButton() {
    const { add } = useToaster();

    const handleClick = () => {
        add({
            name: 'corner-notification',
            title: 'Всплывающее уведомление',
            content: 'Это уведомление исчезнет автоматически.',
            autoHiding: 3000,
        });
    };

    return (
        <div style={{ position: 'fixed', right: 16, bottom: 16 }}>
            <Button view="action" size="l" onClick={handleClick}>
                Показать уведомление
            </Button>
        </div>
    );
}

export function App() {
    return (
        <ToasterProvider toaster={toaster}>
            <ShowToastButton />
            <ToasterComponent />
        </ToasterProvider>
    );
}

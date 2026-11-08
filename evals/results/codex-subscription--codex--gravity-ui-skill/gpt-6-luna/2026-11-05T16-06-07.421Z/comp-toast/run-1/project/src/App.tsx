import {Button, ToasterComponent, ToasterProvider, useToaster} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';

function NotificationButton() {
    const {add} = useToaster();

    return (
        <Button
            view="action"
            size="l"
            style={{position: 'fixed', right: 24, bottom: 24}}
            onClick={() =>
                add({
                    name: 'demo-notification',
                    title: 'Готово',
                    content: 'Уведомление исчезнет автоматически.',
                    theme: 'success',
                    autoHiding: 3000,
                })
            }
        >
            Показать уведомление
        </Button>
    );
}

export function App() {
    return (
        <ToasterProvider toaster={toaster}>
            <NotificationButton />
            <ToasterComponent />
        </ToasterProvider>
    );
}

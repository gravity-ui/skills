import {useState} from 'react';
import {Button, Card, Text, TextInput} from '@gravity-ui/uikit';

export function ContactsPage() {
    const [name, setName] = useState('');
    const [sent, setSent] = useState(false);

    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <Text variant="header-1">Контакты</Text>
            <Card style={{padding: 20, maxWidth: 420}}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setSent(true);
                    }}
                    style={{display: 'flex', flexDirection: 'column', gap: 12}}
                >
                    <TextInput
                        size="l"
                        placeholder="Ваше имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Button view="action" size="l" type="submit" disabled={!name.trim()}>
                        Отправить
                    </Button>
                    {sent && (
                        <Text variant="body-1" color="positive">
                            Спасибо, {name.trim()}! Сообщение отправлено ✉️
                        </Text>
                    )}
                </form>
            </Card>
        </div>
    );
}

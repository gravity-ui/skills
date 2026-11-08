import {useRef, useState} from 'react';
import type {ChangeEvent, FormEvent} from 'react';
import {
    Avatar,
    Button,
    Checkbox,
    Flex,
    Select,
    Switch,
    Text,
    TextInput,
} from '@gravity-ui/uikit';

type NotificationKey = 'news' | 'alerts' | 'digest';

interface ProfileSettings {
    name: string;
    email: string;
    avatarUrl: string;
    language: string;
    timezone: string;
    twoFactorEnabled: boolean;
    notifications: Record<NotificationKey, boolean>;
}

const LANGUAGE_OPTIONS = [
    {value: 'ru', content: 'Русский'},
    {value: 'en', content: 'English'},
    {value: 'de', content: 'Deutsch'},
    {value: 'tr', content: 'Türkçe'},
];

const TIMEZONE_OPTIONS = [
    {value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград'},
    {value: 'Europe/Moscow', content: '(UTC+03:00) Москва'},
    {value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург'},
    {value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск'},
    {value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток'},
];

const NOTIFICATION_OPTIONS: Array<{value: NotificationKey; content: string}> = [
    {value: 'news', content: 'Новости продукта'},
    {value: 'alerts', content: 'Системные алерты'},
    {value: 'digest', content: 'Дайджест за неделю'},
];

const INITIAL_SETTINGS: ProfileSettings = {
    name: 'Алексей Иванов',
    email: 'a.ivanov@example.com',
    avatarUrl: '',
    language: 'ru',
    timezone: 'Europe/Moscow',
    twoFactorEnabled: false,
    notifications: {news: true, alerts: true, digest: false},
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

export function App() {
    const [settings, setSettings] = useState<ProfileSettings>(INITIAL_SETTINGS);
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const updateField = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
        setSaved(false);
        setSettings((prev) => ({...prev, [key]: value}));
    };

    const handleNotificationChange = (key: NotificationKey, checked: boolean) => {
        setSaved(false);
        setSettings((prev) => ({
            ...prev,
            notifications: {...prev.notifications, [key]: checked},
        }));
    };

    const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        if (settings.avatarUrl) {
            URL.revokeObjectURL(settings.avatarUrl);
        }
        updateField('avatarUrl', URL.createObjectURL(file));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // In a real app the settings would be sent to the backend here.
        setSaved(true);
    };

    const handleCancel = () => {
        if (settings.avatarUrl) {
            URL.revokeObjectURL(settings.avatarUrl);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setSettings(INITIAL_SETTINGS);
        setSaved(false);
    };

    return (
        <form onSubmit={handleSubmit} style={{maxWidth: 480, margin: '0 auto', padding: 32}}>
            <Flex direction="column" gap={6}>
                <Text variant="header-1">Настройки профиля</Text>

                <Flex alignItems="center" gap={4}>
                    {settings.avatarUrl ? (
                        <Avatar size="xl" imgUrl={settings.avatarUrl} alt="Аватар пользователя" />
                    ) : (
                        <Avatar size="xl" text={getInitials(settings.name)} />
                    )}
                    <Button view="outlined" onClick={() => fileInputRef.current?.click()}>
                        Загрузить аватар
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{display: 'none'}}
                        onChange={handleAvatarChange}
                    />
                </Flex>

                <Flex direction="column" gap={2}>
                    <Text variant="subheader-1">Имя</Text>
                    <TextInput
                        size="l"
                        value={settings.name}
                        onUpdate={(value) => updateField('name', value)}
                        placeholder="Введите имя"
                        hasClear
                    />
                </Flex>

                <Flex direction="column" gap={2}>
                    <Text variant="subheader-1">Email</Text>
                    <TextInput
                        size="l"
                        type="email"
                        value={settings.email}
                        onUpdate={(value) => updateField('email', value)}
                        placeholder="name@example.com"
                        hasClear
                    />
                </Flex>

                <Flex direction="column" gap={2}>
                    <Text variant="subheader-1">Язык интерфейса</Text>
                    <Select
                        size="l"
                        width="max"
                        value={[settings.language]}
                        onUpdate={(value) => updateField('language', value[0] ?? settings.language)}
                        options={LANGUAGE_OPTIONS}
                        placeholder="Выберите язык"
                    />
                </Flex>

                <Flex direction="column" gap={2}>
                    <Text variant="subheader-1">Часовой пояс</Text>
                    <Select
                        size="l"
                        width="max"
                        value={[settings.timezone]}
                        onUpdate={(value) => updateField('timezone', value[0] ?? settings.timezone)}
                        options={TIMEZONE_OPTIONS}
                        placeholder="Выберите часовой пояс"
                    />
                </Flex>

                <Switch
                    size="l"
                    checked={settings.twoFactorEnabled}
                    onUpdate={(checked) => updateField('twoFactorEnabled', checked)}
                    content="Двухфакторная авторизация"
                />

                <Flex direction="column" gap={2}>
                    <Text variant="subheader-1">Email-уведомления</Text>
                    <Flex direction="column" gap={2}>
                        {NOTIFICATION_OPTIONS.map((option) => (
                            <Checkbox
                                key={option.value}
                                size="l"
                                checked={settings.notifications[option.value]}
                                onUpdate={(checked) => handleNotificationChange(option.value, checked)}
                                content={option.content}
                            />
                        ))}
                    </Flex>
                </Flex>

                <Flex gap={3}>
                    <Button type="submit" view="action" size="l">
                        Сохранить
                    </Button>
                    <Button view="flat" size="l" onClick={handleCancel}>
                        Отмена
                    </Button>
                </Flex>

                {saved ? <Text color="positive">Настройки сохранены</Text> : null}
            </Flex>
        </form>
    );
}

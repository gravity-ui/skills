import {useState} from 'react';

import {FormRow} from '@gravity-ui/components';
import {
    Avatar,
    Button,
    Card,
    Checkbox,
    Flex,
    Icon,
    Select,
    Switch,
    Text,
    TextInput,
    useFileInput,
} from '@gravity-ui/uikit';
import {Camera} from '@gravity-ui/icons';

type Language = 'ru' | 'en';
type TimeZone = 'Europe/Moscow' | 'Europe/London' | 'America/New_York' | 'Asia/Tokyo';

const LANGUAGES: Array<{value: Language; label: string}> = [
    {value: 'ru', label: 'Русский'},
    {value: 'en', label: 'English'},
];

const TIME_ZONES: Array<{value: TimeZone; label: string}> = [
    {value: 'Europe/Moscow', label: '(UTC+03:00) Москва'},
    {value: 'Europe/London', label: '(UTC+00:00) Лондон'},
    {value: 'America/New_York', label: '(UTC-05:00) Нью-Йорк'},
    {value: 'Asia/Tokyo', label: '(UTC+09:00) Токио'},
];

const NOTIFICATIONS = [
    {key: 'productNews', label: 'Новости продукта'},
    {key: 'systemAlerts', label: 'Системные алерты'},
    {key: 'weeklyDigest', label: 'Дайджест за неделю'},
] as const;

type NotificationKey = (typeof NOTIFICATIONS)[number]['key'];

type ProfileForm = {
    name: string;
    email: string;
    language: Language;
    timeZone: TimeZone;
    twoFactorAuth: boolean;
    notifications: Record<NotificationKey, boolean>;
};

const INITIAL_FORM: ProfileForm = {
    name: 'Алексей Иванов',
    email: 'alexey@example.com',
    language: 'ru',
    timeZone: 'Europe/Moscow',
    twoFactorAuth: true,
    notifications: {
        productNews: true,
        systemAlerts: true,
        weeklyDigest: false,
    },
};

export function App() {
    const [form, setForm] = useState<ProfileForm>(INITIAL_FORM);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const {controlProps, triggerProps} = useFileInput({
        onUpdate: (files) => {
            const file = files[0];

            if (file) {
                setAvatarUrl(URL.createObjectURL(file));
            }
        },
    });

    const updateField = <Key extends keyof ProfileForm>(
        key: Key,
        value: ProfileForm[Key],
    ) => {
        setForm((current) => ({...current, [key]: value}));
    };

    const updateNotification = (key: NotificationKey, value: boolean) => {
        setForm((current) => ({
            ...current,
            notifications: {...current.notifications, [key]: value},
        }));
    };

    const handleCancel = () => {
        setForm(INITIAL_FORM);
        setAvatarUrl(null);
    };

    return (
        <Flex
            alignItems="flex-start"
            justifyContent="center"
            spacing={{px: 4, py: 6}}
            style={{minHeight: '100vh'}}
        >
            <Card type="container" view="raised" style={{width: 720, maxWidth: '100%'}}>
                <Flex direction="column" spacing={{p: 8}}>
                    <Flex direction="column" gap={1}>
                        <Text variant="header-1">Настройки профиля</Text>
                        <Text variant="body-2" color="secondary">
                            Управляйте личной информацией и параметрами аккаунта
                        </Text>
                    </Flex>

                    <Flex direction="column" gap={6}>
                        <FormRow label="Имя" required fieldId="profile-name">
                            <TextInput
                                id="profile-name"
                                name="name"
                                size="l"
                                value={form.name}
                                onUpdate={(value) => updateField('name', value)}
                            />
                        </FormRow>

                        <FormRow label="Email" required fieldId="profile-email">
                            <TextInput
                                id="profile-email"
                                name="email"
                                size="l"
                                type="email"
                                value={form.email}
                                onUpdate={(value) => updateField('email', value)}
                            />
                        </FormRow>

                        <FormRow label="Аватар">
                            <Flex alignItems="center" gap={4}>
                                <Avatar
                                    size="xl"
                                    shape="circle"
                                    imgUrl={avatarUrl ?? undefined}
                                    text={form.name.trim() || 'Пользователь'}
                                />
                                <Flex direction="column" alignItems="flex-start" gap={1}>
                                    <input {...controlProps} accept="image/png,image/jpeg,image/webp" />
                                    <Button view="outlined" {...triggerProps}>
                                        <Icon data={Camera} size={16} />
                                        Загрузить фото
                                    </Button>
                                    <Text variant="caption-1" color="secondary">
                                        JPG, PNG или WEBP
                                    </Text>
                                </Flex>
                            </Flex>
                        </FormRow>

                        <FormRow label="Язык интерфейса" fieldId="profile-language">
                            <Select
                                id="profile-language"
                                size="l"
                                width="max"
                                value={[form.language]}
                                options={LANGUAGES.map(({value, label}) => ({
                                    value,
                                    content: label,
                                }))}
                                onUpdate={(value) =>
                                    updateField('language', (value[0] as Language) ?? 'ru')
                                }
                            />
                        </FormRow>

                        <FormRow label="Часовой пояс" fieldId="profile-timezone">
                            <Select
                                id="profile-timezone"
                                size="l"
                                width="max"
                                value={[form.timeZone]}
                                options={TIME_ZONES.map(({value, label}) => ({
                                    value,
                                    content: label,
                                }))}
                                onUpdate={(value) =>
                                    updateField('timeZone', (value[0] as TimeZone) ?? 'Europe/Moscow')
                                }
                            />
                        </FormRow>

                        <FormRow label="Двухфакторная авторизация">
                            <Switch
                                size="l"
                                checked={form.twoFactorAuth}
                                onUpdate={(checked) => updateField('twoFactorAuth', checked)}
                            >
                                Дополнительная защита аккаунта
                            </Switch>
                        </FormRow>

                        <FormRow label="Email-уведомления">
                            <Flex direction="column" gap={3}>
                                {NOTIFICATIONS.map((notification) => (
                                    <Checkbox
                                        key={notification.key}
                                        size="l"
                                        checked={form.notifications[notification.key]}
                                        onUpdate={(checked) =>
                                            updateNotification(notification.key, checked)
                                        }
                                    >
                                        {notification.label}
                                    </Checkbox>
                                ))}
                            </Flex>
                        </FormRow>
                    </Flex>

                    <Flex justifyContent="flex-end" gap={3}>
                        <Button view="flat" size="l" onClick={handleCancel}>
                            Отмена
                        </Button>
                        <Button view="action" size="l" onClick={() => undefined}>
                            Сохранить
                        </Button>
                    </Flex>
                </Flex>
            </Card>
        </Flex>
    );
}

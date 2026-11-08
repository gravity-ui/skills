import React from 'react';

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
} from '@gravity-ui/uikit';
import {Camera, TrashBin} from '@gravity-ui/icons';

import './App.css';

const LANGUAGES = [
    {value: 'ru', content: 'Русский'},
    {value: 'en', content: 'English'},
    {value: 'de', content: 'Deutsch'},
    {value: 'fr', content: 'Français'},
    {value: 'es', content: 'Español'},
    {value: 'zh', content: '中文'},
];

const TIMEZONES = [
    {value: 'Europe/Kaliningrad', content: 'Калининград (UTC+2)'},
    {value: 'Europe/Moscow', content: 'Москва (UTC+3)'},
    {value: 'Europe/Samara', content: 'Самара (UTC+4)'},
    {value: 'Asia/Yekaterinburg', content: 'Екатеринбург (UTC+5)'},
    {value: 'Asia/Omsk', content: 'Омск (UTC+6)'},
    {value: 'Asia/Novosibirsk', content: 'Новосибирск (UTC+7)'},
    {value: 'Asia/Irkutsk', content: 'Иркутск (UTC+8)'},
    {value: 'Asia/Vladivostok', content: 'Владивосток (UTC+10)'},
    {value: 'Europe/London', content: 'Лондон (UTC+0)'},
    {value: 'Europe/Berlin', content: 'Берлин (UTC+1)'},
    {value: 'America/New_York', content: 'Нью-Йорк (UTC−5)'},
    {value: 'Asia/Tokyo', content: 'Токио (UTC+9)'},
];

interface NotificationSettings {
    productNews: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
}

interface ProfileFormState {
    name: string;
    email: string;
    avatarUrl: string | null;
    language: string[];
    timezone: string[];
    twoFactor: boolean;
    notifications: NotificationSettings;
}

interface ProfileFormErrors {
    name?: string;
    email?: string;
}

const INITIAL_STATE: ProfileFormState = {
    name: 'Анна Смирнова',
    email: 'anna.smirnova@example.com',
    avatarUrl: null,
    language: ['ru'],
    timezone: ['Europe/Moscow'],
    twoFactor: false,
    notifications: {
        productNews: true,
        systemAlerts: true,
        weeklyDigest: false,
    },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return '?';
    }

    return parts
        .slice(0, 2)
        .map((part) => part[0]!.toUpperCase())
        .join('');
}

interface FieldProps {
    id: string;
    label: string;
    hint?: string;
    children: React.ReactNode;
}

function Field({id, label, hint, children}: FieldProps) {
    return (
        <Flex direction="column" gap={2}>
            <Text as="label" htmlFor={id} variant="body-2" color="secondary">
                {label}
            </Text>
            {children}
            {hint ? (
                <Text variant="caption-2" color="hint">
                    {hint}
                </Text>
            ) : null}
        </Flex>
    );
}

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

function Section({title, children}: SectionProps) {
    return (
        <Card spacing={{p: 6}}>
            <Flex direction="column" gap={5}>
                <Text as="h2" variant="header-1">
                    {title}
                </Text>
                {children}
            </Flex>
        </Card>
    );
}

export function App() {
    const [form, setForm] = React.useState<ProfileFormState>(INITIAL_STATE);
    const [errors, setErrors] = React.useState<ProfileFormErrors>({});
    const [saved, setSaved] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const patch = React.useCallback((patchValue: Partial<ProfileFormState>) => {
        setForm((prev) => ({...prev, ...patchValue}));
        setSaved(false);
    }, []);

    const patchNotifications = React.useCallback(
        (key: keyof NotificationSettings, checked: boolean) => {
            setForm((prev) => ({
                ...prev,
                notifications: {...prev.notifications, [key]: checked},
            }));
            setSaved(false);
        },
        [],
    );

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (form.avatarUrl) {
            URL.revokeObjectURL(form.avatarUrl);
        }

        patch({avatarUrl: URL.createObjectURL(file)});
        // Позволяет повторно выбрать тот же файл
        event.target.value = '';
    };

    const handleAvatarRemove = () => {
        if (form.avatarUrl) {
            URL.revokeObjectURL(form.avatarUrl);
        }

        patch({avatarUrl: null});
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const nextErrors: ProfileFormErrors = {};

        if (!form.name.trim()) {
            nextErrors.name = 'Укажите имя';
        }

        if (!EMAIL_PATTERN.test(form.email.trim())) {
            nextErrors.email = 'Укажите корректный email';
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            setSaved(false);
            return;
        }

        // Здесь был бы запрос к API сохранения профиля
        setSaved(true);
    };

    const handleCancel = () => {
        if (form.avatarUrl && form.avatarUrl !== INITIAL_STATE.avatarUrl) {
            URL.revokeObjectURL(form.avatarUrl);
        }

        setForm(INITIAL_STATE);
        setErrors({});
        setSaved(false);
    };

    return (
        <div className="app">
            <div className="app__container">
                <Flex direction="column" gap={6}>
                    <Text as="h1" variant="display-1">
                        Настройки профиля
                    </Text>

                    <form onSubmit={handleSubmit} noValidate>
                        <Flex direction="column" gap={5}>
                            <Section title="Основная информация">
                                <Flex alignItems="center" gap={4}>
                                    <div style={{flexShrink: 0}}>
                                        {form.avatarUrl ? (
                                            <Avatar
                                                size="xl"
                                                imgUrl={form.avatarUrl}
                                                alt="Аватар профиля"
                                            />
                                        ) : (
                                            <Avatar size="xl" text={getInitials(form.name)} />
                                        )}
                                    </div>
                                    <Flex direction="column" gap={2} style={{flex: 1, minWidth: 0}}>
                                        <Flex gap={2} wrap="wrap">
                                            <Button onClick={() => fileInputRef.current?.click()}>
                                                <Button.Icon>
                                                    <Icon data={Camera} size={16} />
                                                </Button.Icon>
                                                Загрузить фото
                                            </Button>
                                            {form.avatarUrl ? (
                                                <Button view="flat-danger" onClick={handleAvatarRemove}>
                                                    <Button.Icon>
                                                        <Icon data={TrashBin} size={16} />
                                                    </Button.Icon>
                                                    Удалить
                                                </Button>
                                            ) : null}
                                        </Flex>
                                        <Text variant="caption-2" color="hint">
                                            PNG или JPG, до 5 МБ
                                        </Text>
                                    </Flex>
                                </Flex>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    className="app__file-input"
                                    onChange={handleAvatarChange}
                                />

                                <Field id="profile-name" label="Имя">
                                    <TextInput
                                        id="profile-name"
                                        size="l"
                                        value={form.name}
                                        placeholder="Иван Иванов"
                                        hasClear
                                        error={errors.name}
                                        onUpdate={(value) => {
                                            patch({name: value});
                                            setErrors((prev) => ({...prev, name: undefined}));
                                        }}
                                    />
                                </Field>

                                <Field
                                    id="profile-email"
                                    label="Email"
                                    hint="На этот адрес приходят уведомления и коды входа"
                                >
                                    <TextInput
                                        id="profile-email"
                                        type="email"
                                        size="l"
                                        value={form.email}
                                        placeholder="name@example.com"
                                        hasClear
                                        error={errors.email}
                                        onUpdate={(value) => {
                                            patch({email: value});
                                            setErrors((prev) => ({...prev, email: undefined}));
                                        }}
                                    />
                                </Field>
                            </Section>

                            <Section title="Язык и регион">
                                <Field id="profile-language" label="Язык интерфейса">
                                    <Select
                                        id="profile-language"
                                        size="l"
                                        width="max"
                                        value={form.language}
                                        options={LANGUAGES}
                                        onUpdate={(value) => patch({language: value})}
                                    />
                                </Field>

                                <Field id="profile-timezone" label="Часовой пояс">
                                    <Select
                                        id="profile-timezone"
                                        size="l"
                                        width="max"
                                        value={form.timezone}
                                        options={TIMEZONES}
                                        onUpdate={(value) => patch({timezone: value})}
                                    />
                                </Field>
                            </Section>

                            <Section title="Безопасность">
                                <Flex alignItems="center" gap={4}>
                                    <Flex
                                        direction="column"
                                        gap={1}
                                        style={{flex: 1, minWidth: 0}}
                                    >
                                        <Text variant="subheader-1">Двухфакторная авторизация</Text>
                                        <Text variant="body-1" color="secondary">
                                            При входе потребуется дополнительный код из приложения
                                            или SMS
                                        </Text>
                                    </Flex>
                                    <div style={{flexShrink: 0}}>
                                        <Switch
                                            size="l"
                                            checked={form.twoFactor}
                                            onChange={(event) =>
                                                patch({twoFactor: event.target.checked})
                                            }
                                            aria-label="Двухфакторная авторизация"
                                        />
                                    </div>
                                </Flex>
                            </Section>

                            <Section title="Email-уведомления">
                                <Flex direction="column" gap={3}>
                                    <Checkbox
                                        size="l"
                                        checked={form.notifications.productNews}
                                        onChange={(event) =>
                                            patchNotifications('productNews', event.target.checked)
                                        }
                                        content="Новости продукта"
                                    />
                                    <Checkbox
                                        size="l"
                                        checked={form.notifications.systemAlerts}
                                        onChange={(event) =>
                                            patchNotifications(
                                                'systemAlerts',
                                                event.target.checked,
                                            )
                                        }
                                        content="Системные алерты"
                                    />
                                    <Checkbox
                                        size="l"
                                        checked={form.notifications.weeklyDigest}
                                        onChange={(event) =>
                                            patchNotifications(
                                                'weeklyDigest',
                                                event.target.checked,
                                            )
                                        }
                                        content="Дайджест за неделю"
                                    />
                                </Flex>
                            </Section>

                            <Flex alignItems="center" gap={3}>
                                <Button view="action" size="l" type="submit">
                                    Сохранить
                                </Button>
                                <Button view="normal" size="l" type="button" onClick={handleCancel}>
                                    Отмена
                                </Button>
                                {saved ? (
                                    <Text variant="body-2" color="positive">
                                        Изменения сохранены
                                    </Text>
                                ) : null}
                            </Flex>
                        </Flex>
                    </form>
                </Flex>
            </div>
        </div>
    );
}

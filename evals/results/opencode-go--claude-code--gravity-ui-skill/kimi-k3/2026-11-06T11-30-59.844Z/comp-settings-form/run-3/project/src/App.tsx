import * as React from 'react';

import {
    Avatar,
    Box,
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

interface ProfileFormState {
    name: string;
    email: string;
    avatarUrl: string | null;
    language: string;
    timezone: string;
    twoFactorEnabled: boolean;
    notifyProductNews: boolean;
    notifySystemAlerts: boolean;
    notifyWeeklyDigest: boolean;
}

const INITIAL_STATE: ProfileFormState = {
    name: 'Иван Петров',
    email: 'ivan.petrov@example.com',
    avatarUrl: null,
    language: 'ru',
    timezone: 'Europe/Moscow',
    twoFactorEnabled: false,
    notifyProductNews: true,
    notifySystemAlerts: true,
    notifyWeeklyDigest: false,
};

const LANGUAGE_OPTIONS = [
    {value: 'ru', content: 'Русский'},
    {value: 'en', content: 'English'},
    {value: 'de', content: 'Deutsch'},
    {value: 'es', content: 'Español'},
    {value: 'fr', content: 'Français'},
    {value: 'zh', content: '中文'},
];

const TIMEZONE_OPTIONS = [
    {value: 'Europe/London', content: '(UTC+0) Лондон'},
    {value: 'Europe/Berlin', content: '(UTC+1) Берлин'},
    {value: 'Europe/Kaliningrad', content: '(UTC+2) Калининград'},
    {value: 'Europe/Moscow', content: '(UTC+3) Москва'},
    {value: 'Europe/Samara', content: '(UTC+4) Самара'},
    {value: 'Asia/Yekaterinburg', content: '(UTC+5) Екатеринбург'},
    {value: 'Asia/Omsk', content: '(UTC+6) Омск'},
    {value: 'Asia/Krasnoyarsk', content: '(UTC+7) Красноярск'},
    {value: 'Asia/Irkutsk', content: '(UTC+8) Иркутск'},
    {value: 'Asia/Yakutsk', content: '(UTC+9) Якутск'},
    {value: 'Asia/Tokyo', content: '(UTC+9) Токио'},
    {value: 'Asia/Vladivostok', content: '(UTC+10) Владивосток'},
    {value: 'America/New_York', content: '(UTC−5) Нью-Йорк'},
    {value: 'America/Los_Angeles', content: '(UTC−8) Лос-Анджелес'},
];

function Field({label, hint, children}: {label: string; hint?: string; children: React.ReactNode}) {
    return (
        <Flex direction="column" gap={2}>
            <Text variant="body-2">{label}</Text>
            {children}
            {hint ? (
                <Text variant="caption-2" color="hint">
                    {hint}
                </Text>
            ) : null}
        </Flex>
    );
}

function SectionTitle({children}: {children: React.ReactNode}) {
    return (
        <Text variant="subheader-2" as="h2">
            {children}
        </Text>
    );
}

export function App() {
    const [form, setForm] = React.useState<ProfileFormState>(INITIAL_STATE);
    const [savedSnapshot, setSavedSnapshot] = React.useState<ProfileFormState>(INITIAL_STATE);
    const [justSaved, setJustSaved] = React.useState(false);
    const [emailError, setEmailError] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const update = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
        setForm((prev) => ({...prev, [key]: value}));
        setJustSaved(false);
    };

    // Revoke the object URL when it is replaced or the page unmounts.
    const avatarUrlRef = React.useRef<string | null>(form.avatarUrl);
    avatarUrlRef.current = form.avatarUrl;
    React.useEffect(() => {
        return () => {
            if (avatarUrlRef.current) {
                URL.revokeObjectURL(avatarUrlRef.current);
            }
        };
    }, []);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        if (form.avatarUrl) {
            URL.revokeObjectURL(form.avatarUrl);
        }
        update('avatarUrl', URL.createObjectURL(file));
        // Allow selecting the same file again.
        event.target.value = '';
    };

    const handleAvatarRemove = () => {
        if (form.avatarUrl) {
            URL.revokeObjectURL(form.avatarUrl);
        }
        update('avatarUrl', null);
    };

    const handleSave = () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setEmailError('Введите корректный email');
            return;
        }
        setEmailError(null);
        setSavedSnapshot(form);
        setJustSaved(true);
    };

    const handleCancel = () => {
        setForm(savedSnapshot);
        setEmailError(null);
        setJustSaved(false);
    };

    const initials =
        form.name
            .trim()
            .split(/\s+/)
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || '?';

    return (
        <Box spacing={{p: 6}} className="app">
            <Flex direction="column" gap={6} className="app__container">
                <Text variant="header-1" as="h1">
                    Настройки профиля
                </Text>

                <Card type="container" view="outlined" size="l" spacing={{p: 6}}>
                    <Flex direction="column" gap={6}>
                        <Flex direction="column" gap={4}>
                            <SectionTitle>Основная информация</SectionTitle>
                            <Field label="Имя">
                                <TextInput
                                    size="l"
                                    value={form.name}
                                    onUpdate={(value) => update('name', value)}
                                    placeholder="Имя и фамилия"
                                />
                            </Field>
                            <Field label="Email">
                                <TextInput
                                    size="l"
                                    type="email"
                                    value={form.email}
                                    onUpdate={(value) => {
                                        update('email', value);
                                        setEmailError(null);
                                    }}
                                    placeholder="you@example.com"
                                    validationState={emailError ? 'invalid' : undefined}
                                    errorMessage={emailError ?? undefined}
                                />
                            </Field>
                        </Flex>

                        <Flex direction="column" gap={4}>
                            <SectionTitle>Аватар</SectionTitle>
                            <Flex alignItems="center" gap={4}>
                                <div style={{flexShrink: 0}}>
                                    {form.avatarUrl ? (
                                        <Avatar
                                            imgUrl={form.avatarUrl}
                                            size="xl"
                                            withImageBorder
                                            alt="Аватар"
                                        />
                                    ) : (
                                        <Avatar text={initials} size="xl" theme="brand" />
                                    )}
                                </div>
                                <Flex direction="column" gap={2} style={{flex: 1, minWidth: 0}}>
                                    <Flex gap={2} wrap>
                                        <Button
                                            size="m"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Icon data={Camera} size={16} />
                                            Загрузить фото
                                        </Button>
                                        {form.avatarUrl ? (
                                            <Button
                                                view="flat-danger"
                                                size="m"
                                                onClick={handleAvatarRemove}
                                            >
                                                <Icon data={TrashBin} size={16} />
                                                Удалить
                                            </Button>
                                        ) : null}
                                    </Flex>
                                    <Text variant="caption-2" color="hint">
                                        PNG или JPG, рекомендуемый размер — не менее 256×256.
                                    </Text>
                                </Flex>
                            </Flex>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="app__hidden-input"
                                onChange={handleAvatarChange}
                            />
                        </Flex>

                        <Flex direction="column" gap={4}>
                            <SectionTitle>Региональные настройки</SectionTitle>
                            <Field label="Язык интерфейса">
                                <Select
                                    size="l"
                                    width="max"
                                    value={[form.language]}
                                    options={LANGUAGE_OPTIONS}
                                    onUpdate={(value) => update('language', value[0] ?? '')}
                                />
                            </Field>
                            <Field label="Часовой пояс">
                                <Select
                                    size="l"
                                    width="max"
                                    filterable
                                    filterPlaceholder="Поиск по городу или UTC"
                                    value={[form.timezone]}
                                    options={TIMEZONE_OPTIONS}
                                    onUpdate={(value) => update('timezone', value[0] ?? '')}
                                />
                            </Field>
                        </Flex>

                        <Flex direction="column" gap={4}>
                            <SectionTitle>Безопасность</SectionTitle>
                            <Flex alignItems="center" justifyContent="space-between" gap={4}>
                                <Flex
                                    direction="column"
                                    gap={1}
                                    style={{flex: 1, minWidth: 0}}
                                >
                                    <Text variant="body-2">Двухфакторная авторизация</Text>
                                    <Text variant="caption-2" color="hint">
                                        При входе потребуется одноразовый код из приложения.
                                    </Text>
                                </Flex>
                                <Switch
                                    size="l"
                                    checked={form.twoFactorEnabled}
                                    onUpdate={(checked) => update('twoFactorEnabled', checked)}
                                    aria-label="Двухфакторная авторизация"
                                    style={{flexShrink: 0}}
                                />
                            </Flex>
                        </Flex>

                        <Flex direction="column" gap={4}>
                            <SectionTitle>Email-уведомления</SectionTitle>
                            <Flex direction="column" gap={3}>
                                <Checkbox
                                    size="l"
                                    checked={form.notifyProductNews}
                                    onUpdate={(checked) => update('notifyProductNews', checked)}
                                    content="Новости продукта"
                                />
                                <Checkbox
                                    size="l"
                                    checked={form.notifySystemAlerts}
                                    onUpdate={(checked) => update('notifySystemAlerts', checked)}
                                    content="Системные алерты"
                                />
                                <Checkbox
                                    size="l"
                                    checked={form.notifyWeeklyDigest}
                                    onUpdate={(checked) => update('notifyWeeklyDigest', checked)}
                                    content="Дайджест за неделю"
                                />
                            </Flex>
                        </Flex>

                        <Flex alignItems="center" gap={3}>
                            <Button view="action" size="l" onClick={handleSave}>
                                Сохранить
                            </Button>
                            <Button view="outlined" size="l" onClick={handleCancel}>
                                Отмена
                            </Button>
                            {justSaved ? (
                                <Text variant="body-2" color="positive">
                                    Изменения сохранены
                                </Text>
                            ) : null}
                        </Flex>
                    </Flex>
                </Card>
            </Flex>
        </Box>
    );
}

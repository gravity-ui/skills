import * as React from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    Checkbox,
    Divider,
    Flex,
    Icon,
    Select,
    Switch,
    Text,
    TextInput,
    useFileInput,
    useToaster,
} from '@gravity-ui/uikit';
import {Camera} from '@gravity-ui/icons';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 МБ

const LANGUAGES = [
    {value: 'ru', content: 'Русский'},
    {value: 'en', content: 'English'},
    {value: 'de', content: 'Deutsch'},
    {value: 'fr', content: 'Français'},
    {value: 'es', content: 'Español'},
    {value: 'zh', content: '中文'},
];

const TIMEZONES = [
    {value: 'Europe/Kaliningrad', content: '(UTC+2) Калининград'},
    {value: 'Europe/Moscow', content: '(UTC+3) Москва'},
    {value: 'Asia/Dubai', content: '(UTC+4) Дубай'},
    {value: 'Asia/Yekaterinburg', content: '(UTC+5) Екатеринбург'},
    {value: 'Asia/Novosibirsk', content: '(UTC+7) Новосибирск'},
    {value: 'Asia/Vladivostok', content: '(UTC+10) Владивосток'},
    {value: 'Europe/London', content: '(UTC+0) Лондон'},
    {value: 'Europe/Berlin', content: '(UTC+1) Берлин'},
    {value: 'America/New_York', content: '(UTC−5) Нью-Йорк'},
    {value: 'America/Los_Angeles', content: '(UTC−8) Лос-Анджелес'},
    {value: 'Asia/Tokyo', content: '(UTC+9) Токио'},
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
    language: string;
    timezone: string;
    twoFactor: boolean;
    notifications: NotificationSettings;
}

const INITIAL_STATE: ProfileFormState = {
    name: 'Иван Петров',
    email: 'ivan.petrov@example.com',
    avatarUrl: null,
    language: 'ru',
    timezone: 'Europe/Moscow',
    twoFactor: false,
    notifications: {
        productNews: true,
        systemAlerts: true,
        weeklyDigest: false,
    },
};

const NOTIFICATION_OPTIONS: {key: keyof NotificationSettings; label: string}[] = [
    {key: 'productNews', label: 'Новости продукта'},
    {key: 'systemAlerts', label: 'Системные алерты'},
    {key: 'weeklyDigest', label: 'Дайджест за неделю'},
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getInitials(name: string): string {
    return (
        name
            .trim()
            .split(/\s+/)
            .map((word) => word[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || '?'
    );
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
    return (
        <Flex direction="column" gap={4}>
            <Text variant="subheader-2">{title}</Text>
            {children}
        </Flex>
    );
}

function Field({
    label,
    htmlFor,
    children,
}: {
    label: string;
    htmlFor: string;
    children: React.ReactNode;
}) {
    return (
        <Flex direction="column" gap={1} style={{maxWidth: 420}}>
            <label htmlFor={htmlFor} style={{alignSelf: 'flex-start'}}>
                <Text variant="body-2">{label}</Text>
            </label>
            {children}
        </Flex>
    );
}

export function ProfileSettingsPage() {
    const {add} = useToaster();
    const [saved, setSaved] = React.useState<ProfileFormState>(INITIAL_STATE);
    const [form, setForm] = React.useState<ProfileFormState>(INITIAL_STATE);
    const [nameError, setNameError] = React.useState<string>();
    const [emailError, setEmailError] = React.useState<string>();
    const avatarUrlRef = React.useRef<string | null>(null);

    // Освобождаем object URL при замене и при размонтировании
    React.useEffect(() => {
        return () => {
            if (avatarUrlRef.current) {
                URL.revokeObjectURL(avatarUrlRef.current);
            }
        };
    }, []);

    const updateForm = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
        setForm((prev) => ({...prev, [key]: value}));
    };

    const handleAvatarUpdate = React.useCallback(
        (files: File[]) => {
            const file = files[0];
            if (!file) {
                return;
            }
            if (file.size > MAX_AVATAR_SIZE) {
                add({
                    name: 'avatar-too-big',
                    title: 'Не удалось загрузить фото',
                    content: 'Размер файла не должен превышать 5 МБ',
                    theme: 'danger',
                });
                return;
            }
            if (avatarUrlRef.current) {
                URL.revokeObjectURL(avatarUrlRef.current);
            }
            const url = URL.createObjectURL(file);
            avatarUrlRef.current = url;
            setForm((prev) => ({...prev, avatarUrl: url}));
        },
        [add],
    );

    const {controlProps, triggerProps} = useFileInput({onUpdate: handleAvatarUpdate});

    const dirty = JSON.stringify(form) !== JSON.stringify(saved);

    const handleSave = () => {
        const nextNameError = form.name.trim() ? undefined : 'Введите имя';
        const nextEmailError = EMAIL_RE.test(form.email.trim())
            ? undefined
            : 'Введите корректный email';
        setNameError(nextNameError);
        setEmailError(nextEmailError);
        if (nextNameError || nextEmailError) {
            return;
        }
        setSaved(form);
        add({name: 'settings-saved', title: 'Настройки сохранены', theme: 'success'});
    };

    const handleCancel = () => {
        setForm(saved);
        setNameError(undefined);
        setEmailError(undefined);
    };

    return (
        <Box spacing={{py: 6, px: 4}}>
            <Flex direction="column" gap={5} style={{maxWidth: 680, margin: '0 auto'}}>
                <Text variant="header-1">Настройки профиля</Text>

                <Card type="container" view="outlined" size="l">
                    <Box spacing={{p: 5}}>
                        <Flex direction="column" gap={6}>
                            <Section title="Основная информация">
                                <Flex alignItems="center" gap={4}>
                                    {form.avatarUrl ? (
                                        <Avatar
                                            size="xl"
                                            imgUrl={form.avatarUrl}
                                            style={{flexShrink: 0}}
                                        />
                                    ) : (
                                        <Avatar
                                            size="xl"
                                            text={getInitials(form.name)}
                                            style={{flexShrink: 0}}
                                        />
                                    )}
                                    <Flex
                                        direction="column"
                                        gap={1}
                                        style={{flex: 1, minWidth: 0}}
                                    >
                                        <input
                                            {...controlProps}
                                            accept="image/*"
                                            style={{display: 'none'}}
                                        />
                                        <div>
                                            <Button {...triggerProps} view="outlined" size="m">
                                                <Icon data={Camera} size={16} />
                                                Загрузить фото
                                            </Button>
                                        </div>
                                        <Text variant="caption-2" color="secondary">
                                            PNG или JPG, до 5 МБ
                                        </Text>
                                    </Flex>
                                </Flex>

                                <Field label="Имя" htmlFor="name-input">
                                    <TextInput
                                        id="name-input"
                                        size="l"
                                        value={form.name}
                                        onUpdate={(value) => updateForm('name', value)}
                                        placeholder="Имя и фамилия"
                                        errorMessage={nameError}
                                        validationState={nameError ? 'invalid' : undefined}
                                        style={{width: '100%'}}
                                    />
                                </Field>

                                <Field label="Email" htmlFor="email-input">
                                    <TextInput
                                        id="email-input"
                                        type="email"
                                        size="l"
                                        value={form.email}
                                        onUpdate={(value) => updateForm('email', value)}
                                        placeholder="you@example.com"
                                        errorMessage={emailError}
                                        validationState={emailError ? 'invalid' : undefined}
                                        style={{width: '100%'}}
                                    />
                                </Field>
                            </Section>

                            <Divider />

                            <Section title="Региональные настройки">
                                <Field label="Язык интерфейса" htmlFor="language-select">
                                    <Select
                                        id="language-select"
                                        size="l"
                                        width="max"
                                        value={[form.language]}
                                        onUpdate={(value) =>
                                            updateForm('language', value[0] ?? form.language)
                                        }
                                        options={LANGUAGES}
                                    />
                                </Field>

                                <Field label="Часовой пояс" htmlFor="timezone-select">
                                    <Select
                                        id="timezone-select"
                                        size="l"
                                        width="max"
                                        filterable
                                        filterPlaceholder="Поиск по городам"
                                        value={[form.timezone]}
                                        onUpdate={(value) =>
                                            updateForm('timezone', value[0] ?? form.timezone)
                                        }
                                        options={TIMEZONES}
                                    />
                                </Field>
                            </Section>

                            <Divider />

                            <Section title="Безопасность">
                                <Flex direction="column" gap={1}>
                                    <Switch
                                        checked={form.twoFactor}
                                        onUpdate={(checked) => updateForm('twoFactor', checked)}
                                    >
                                        Двухфакторная авторизация
                                    </Switch>
                                    <Text variant="caption-2" color="secondary">
                                        При входе в аккаунт потребуется код из
                                        приложения-аутентификатора
                                    </Text>
                                </Flex>
                            </Section>

                            <Divider />

                            <Section title="Email-уведомления">
                                <Flex direction="column" gap={2}>
                                    {NOTIFICATION_OPTIONS.map(({key, label}) => (
                                        <Checkbox
                                            key={key}
                                            size="l"
                                            checked={form.notifications[key]}
                                            onUpdate={(checked) =>
                                                setForm((prev) => ({
                                                    ...prev,
                                                    notifications: {
                                                        ...prev.notifications,
                                                        [key]: checked,
                                                    },
                                                }))
                                            }
                                            content={label}
                                        />
                                    ))}
                                </Flex>
                            </Section>

                            <Divider />

                            <Flex gap={2}>
                                <Button view="action" size="l" onClick={handleSave}>
                                    Сохранить
                                </Button>
                                <Button
                                    view="normal"
                                    size="l"
                                    onClick={handleCancel}
                                    disabled={!dirty}
                                >
                                    Отмена
                                </Button>
                            </Flex>
                        </Flex>
                    </Box>
                </Card>
            </Flex>
        </Box>
    );
}

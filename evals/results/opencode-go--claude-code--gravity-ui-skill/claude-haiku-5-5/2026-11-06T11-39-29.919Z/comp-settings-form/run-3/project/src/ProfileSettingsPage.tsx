import * as React from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    Checkbox,
    Divider,
    Flex,
    Select,
    Switch,
    Text,
    TextInput,
    useFileInput,
} from '@gravity-ui/uikit';

type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

interface ProfileSettings {
    name: string;
    email: string;
    avatarFile: File | null;
    language: string;
    timezone: string;
    twoFactorEnabled: boolean;
    notifications: Record<NotificationKey, boolean>;
}

interface ProfileErrors {
    name?: string;
    email?: string;
}

const NOTIFICATION_OPTIONS: {key: NotificationKey; label: string}[] = [
    {key: 'productNews', label: 'Новости продукта'},
    {key: 'systemAlerts', label: 'Системные алерты'},
    {key: 'weeklyDigest', label: 'Дайджест за неделю'},
];

const LANGUAGE_OPTIONS = [
    {value: 'ru', content: 'Русский'},
    {value: 'en', content: 'English'},
    {value: 'de', content: 'Deutsch'},
    {value: 'fr', content: 'Français'},
];

const TIMEZONES: {id: string; city: string}[] = [
    {id: 'Europe/Kaliningrad', city: 'Калининград'},
    {id: 'Europe/Moscow', city: 'Москва'},
    {id: 'Europe/Samara', city: 'Самара'},
    {id: 'Asia/Yekaterinburg', city: 'Екатеринбург'},
    {id: 'Asia/Omsk', city: 'Омск'},
    {id: 'Asia/Krasnoyarsk', city: 'Красноярск'},
    {id: 'Asia/Irkutsk', city: 'Иркутск'},
    {id: 'Asia/Yakutsk', city: 'Якутск'},
    {id: 'Asia/Vladivostok', city: 'Владивосток'},
    {id: 'Asia/Kamchatka', city: 'Камчатка'},
    {id: 'Europe/London', city: 'Лондон'},
    {id: 'Europe/Berlin', city: 'Берлин'},
    {id: 'America/New_York', city: 'Нью-Йорк'},
    {id: 'America/Los_Angeles', city: 'Лос-Анджелес'},
    {id: 'Asia/Shanghai', city: 'Шанхай'},
    {id: 'Asia/Tokyo', city: 'Токио'},
    {id: 'UTC', city: 'UTC'},
];

// Shows the current GMT offset next to each city, e.g. "Москва (UTC+3)".
function formatTimezoneLabel(id: string, city: string): string {
    const offset =
        new Intl.DateTimeFormat('en-US', {timeZone: id, timeZoneName: 'shortOffset'})
            .formatToParts(new Date())
            .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
    return `${city} (${offset.replace('GMT', 'UTC')})`;
}

const TIMEZONE_OPTIONS = TIMEZONES.map(({id, city}) => ({
    value: id,
    content: formatTimezoneLabel(id, city),
    text: city,
}));

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_SETTINGS: ProfileSettings = {
    name: 'Анна Иванова',
    email: 'anna.ivanova@example.com',
    avatarFile: null,
    language: 'ru',
    timezone: 'Europe/Moscow',
    twoFactorEnabled: false,
    notifications: {productNews: true, systemAlerts: true, weeklyDigest: false},
};

function validate(settings: ProfileSettings): ProfileErrors {
    const errors: ProfileErrors = {};
    if (!settings.name.trim()) {
        errors.name = 'Введите имя';
    }
    if (!EMAIL_PATTERN.test(settings.email.trim())) {
        errors.email = 'Введите корректный email';
    }
    return errors;
}

function isSameSettings(a: ProfileSettings, b: ProfileSettings): boolean {
    return (
        a.name === b.name &&
        a.email === b.email &&
        a.avatarFile === b.avatarFile &&
        a.language === b.language &&
        a.timezone === b.timezone &&
        a.twoFactorEnabled === b.twoFactorEnabled &&
        NOTIFICATION_OPTIONS.every(({key}) => a.notifications[key] === b.notifications[key])
    );
}

// Creates a preview URL for the selected file and revokes it when the file changes.
function useObjectUrl(file: File | null): string | null {
    const [url, setUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!file) {
            setUrl(null);
            return;
        }
        const next = URL.createObjectURL(file);
        setUrl(next);
        return () => URL.revokeObjectURL(next);
    }, [file]);

    return url;
}

function Section({id, title, children}: {id?: string; title: string; children: React.ReactNode}) {
    return (
        <Flex direction="column" gap={4}>
            <Text as="h2" variant="subheader-2" id={id}>
                {title}
            </Text>
            {children}
        </Flex>
    );
}

function Field({id, label, children}: {id: string; label: string; children: React.ReactNode}) {
    return (
        <Flex direction="column" gap={2}>
            <Text as="label" htmlFor={id} variant="subheader-1">
                {label}
            </Text>
            {children}
        </Flex>
    );
}

export function ProfileSettingsPage() {
    const [saved, setSaved] = React.useState<ProfileSettings>(INITIAL_SETTINGS);
    const [draft, setDraft] = React.useState<ProfileSettings>(INITIAL_SETTINGS);
    const [attempted, setAttempted] = React.useState(false);
    const [justSaved, setJustSaved] = React.useState(false);

    const avatarPreview = useObjectUrl(draft.avatarFile);
    const errors = validate(draft);
    const hasErrors = Object.keys(errors).length > 0;
    const dirty = !isSameSettings(draft, saved);

    const update = (patch: Partial<ProfileSettings>) => {
        setDraft((prev) => ({...prev, ...patch}));
        setJustSaved(false);
    };

    const updateNotification = (key: NotificationKey, checked: boolean) => {
        setDraft((prev) => ({...prev, notifications: {...prev.notifications, [key]: checked}}));
        setJustSaved(false);
    };

    const {controlProps, triggerProps} = useFileInput({
        onUpdate: (files) => {
            const file = files[0];
            if (file && file.type.startsWith('image/')) {
                update({avatarFile: file});
            }
        },
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAttempted(true);
        if (hasErrors) {
            return;
        }
        const next = {...draft, name: draft.name.trim(), email: draft.email.trim()};
        setSaved(next);
        setDraft(next);
        setAttempted(false);
        setJustSaved(true);
    };

    const handleCancel = () => {
        setDraft(saved);
        setAttempted(false);
        setJustSaved(false);
    };

    return (
        <Box spacing={{p: 6}} style={{maxWidth: 720, margin: '0 auto'}}>
            <form onSubmit={handleSubmit} noValidate>
                <Card type="container" view="outlined" size="l">
                    <Flex direction="column" gap={6} spacing={{p: 6}}>
                        <Flex direction="column" gap={1}>
                            <Text as="h1" variant="header-1">
                                Настройки профиля
                            </Text>
                            <Text variant="body-1" color="secondary">
                                Личные данные, интерфейс, безопасность и уведомления
                            </Text>
                        </Flex>

                        <Section title="Личные данные">
                            <Flex alignItems="center" gap={4} style={{flexWrap: 'wrap'}}>
                                {avatarPreview ? (
                                    <Avatar size="xl" shape="circle" imgUrl={avatarPreview} alt="Аватар" />
                                ) : (
                                    <Avatar size="xl" shape="circle" theme="brand" text={draft.name} />
                                )}
                                <Flex direction="column" gap={2} style={{minWidth: 0}}>
                                    <input {...controlProps} accept="image/*" aria-label="Выбрать файл аватара" />
                                    <Flex gap={2} style={{flexWrap: 'wrap'}}>
                                        <Button {...triggerProps} type="button" view="outlined" size="m">
                                            Загрузить фото
                                        </Button>
                                        {draft.avatarFile && (
                                            <Button
                                                type="button"
                                                view="flat"
                                                size="m"
                                                onClick={() => update({avatarFile: null})}
                                            >
                                                Удалить
                                            </Button>
                                        )}
                                    </Flex>
                                    <Text variant="caption-1" color="secondary">
                                        Изображение в формате JPG, PNG или WebP
                                    </Text>
                                </Flex>
                            </Flex>

                            <Field id="profile-name" label="Имя">
                                <TextInput
                                    id="profile-name"
                                    value={draft.name}
                                    onUpdate={(name) => update({name})}
                                    autoComplete="name"
                                    errorMessage={attempted ? errors.name : undefined}
                                    validationState={attempted && errors.name ? 'invalid' : undefined}
                                />
                            </Field>

                            <Field id="profile-email" label="Email">
                                <TextInput
                                    id="profile-email"
                                    type="email"
                                    value={draft.email}
                                    onUpdate={(email) => update({email})}
                                    autoComplete="email"
                                    errorMessage={attempted ? errors.email : undefined}
                                    validationState={attempted && errors.email ? 'invalid' : undefined}
                                />
                            </Field>
                        </Section>

                        <Divider />

                        <Section title="Интерфейс">
                            <Field id="profile-language" label="Язык интерфейса">
                                <Select
                                    id="profile-language"
                                    width="max"
                                    value={[draft.language]}
                                    options={LANGUAGE_OPTIONS}
                                    onUpdate={([language]) => {
                                        if (language) {
                                            update({language});
                                        }
                                    }}
                                />
                            </Field>

                            <Field id="profile-timezone" label="Часовой пояс">
                                <Select
                                    id="profile-timezone"
                                    width="max"
                                    filterable
                                    value={[draft.timezone]}
                                    options={TIMEZONE_OPTIONS}
                                    onUpdate={([timezone]) => {
                                        if (timezone) {
                                            update({timezone});
                                        }
                                    }}
                                />
                            </Field>
                        </Section>

                        <Divider />

                        <Section title="Безопасность">
                            <Flex direction="column" gap={2}>
                                <Switch
                                    size="l"
                                    checked={draft.twoFactorEnabled}
                                    onUpdate={(twoFactorEnabled) => update({twoFactorEnabled})}
                                >
                                    Двухфакторная аутентификация
                                </Switch>
                                <Text variant="body-1" color="secondary">
                                    При входе дополнительно запрашивается код из приложения-аутентификатора
                                </Text>
                            </Flex>
                        </Section>

                        <Divider />

                        <Section id="notifications-title" title="Email-уведомления">
                            <Flex direction="column" gap={3} role="group" aria-labelledby="notifications-title">
                                {NOTIFICATION_OPTIONS.map(({key, label}) => (
                                    <Checkbox
                                        key={key}
                                        size="l"
                                        checked={draft.notifications[key]}
                                        onUpdate={(checked) => updateNotification(key, checked)}
                                    >
                                        {label}
                                    </Checkbox>
                                ))}
                            </Flex>
                        </Section>

                        <Divider />

                        <Flex justifyContent="space-between" alignItems="center" gap={4} style={{flexWrap: 'wrap'}}>
                            <Text variant="body-1" color="positive" aria-live="polite">
                                {justSaved ? 'Изменения сохранены' : ''}
                            </Text>
                            <Flex gap={2}>
                                <Button type="button" view="outlined" size="l" disabled={!dirty} onClick={handleCancel}>
                                    Отмена
                                </Button>
                                <Button type="submit" view="action" size="l" disabled={!dirty}>
                                    Сохранить
                                </Button>
                            </Flex>
                        </Flex>
                    </Flex>
                </Card>
            </form>
        </Box>
    );
}

import * as React from 'react';
import {FormRow} from '@gravity-ui/components';
import {
    Button,
    Card,
    Checkbox,
    Flex,
    Select,
    Switch,
    Text,
    TextInput,
    useLayoutContext,
    useToaster,
} from '@gravity-ui/uikit';

import {AvatarField, type AvatarValue} from './AvatarField';
import {
    LANGUAGE_OPTIONS,
    NOTIFICATION_OPTIONS,
    type NotificationKey,
    TIME_ZONE_OPTIONS,
    getBrowserTimeZone,
} from './options';

import './ProfileSettingsPage.css';

type ProfileSettings = {
    name: string;
    email: string;
    avatar: AvatarValue;
    language: string;
    timeZone: string;
    twoFactor: boolean;
    notifications: Record<NotificationKey, boolean>;
};

type Errors = Partial<Record<'name' | 'email', string>>;

const INITIAL_SETTINGS: ProfileSettings = {
    name: 'Анна Смирнова',
    email: 'anna.smirnova@example.com',
    avatar: null,
    language: 'ru',
    timeZone: getBrowserTimeZone(),
    twoFactor: false,
    notifications: {productNews: true, systemAlerts: true, weeklyDigest: false},
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(settings: ProfileSettings): Errors {
    const errors: Errors = {};
    if (!settings.name.trim()) {
        errors.name = 'Введите имя';
    }
    if (!settings.email.trim()) {
        errors.email = 'Введите email';
    } else if (!EMAIL_RE.test(settings.email.trim())) {
        errors.email = 'Некорректный email';
    }
    return errors;
}

function isEqual(a: ProfileSettings, b: ProfileSettings): boolean {
    return (
        a.name === b.name &&
        a.email === b.email &&
        a.avatar?.url === b.avatar?.url &&
        a.language === b.language &&
        a.timeZone === b.timeZone &&
        a.twoFactor === b.twoFactor &&
        NOTIFICATION_OPTIONS.every(({key}) => a.notifications[key] === b.notifications[key])
    );
}

/** Stand-in for a real API call. */
function saveProfile(settings: ProfileSettings): Promise<ProfileSettings> {
    return new Promise((resolve) => setTimeout(() => resolve(settings), 700));
}

function revokeIfBlob(avatar: AvatarValue) {
    if (avatar?.url.startsWith('blob:')) {
        URL.revokeObjectURL(avatar.url);
    }
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
    return (
        <Card view="outlined" spacing={{p: 5}}>
            <Flex direction="column" gap={4}>
                <Text as="h2" variant="subheader-3">
                    {title}
                </Text>
                <div>{children}</div>
            </Flex>
        </Card>
    );
}

export function ProfileSettingsPage() {
    const toaster = useToaster();
    const {isMediaActive} = useLayoutContext();
    const rowDirection = isMediaActive('m') ? 'row' : 'column';

    const [saved, setSaved] = React.useState<ProfileSettings>(INITIAL_SETTINGS);
    const [draft, setDraft] = React.useState<ProfileSettings>(INITIAL_SETTINGS);
    const [touched, setTouched] = React.useState<Partial<Record<keyof Errors, boolean>>>({});
    const [submitted, setSubmitted] = React.useState(false);
    const [saving, setSaving] = React.useState(false);

    // Keep the latest values reachable from the unmount cleanup.
    const latest = React.useRef({saved, draft});
    latest.current = {saved, draft};
    React.useEffect(
        () => () => {
            revokeIfBlob(latest.current.draft.avatar);
            if (latest.current.saved.avatar?.url !== latest.current.draft.avatar?.url) {
                revokeIfBlob(latest.current.saved.avatar);
            }
        },
        [],
    );

    const errors = validate(draft);
    const visibleError = (field: keyof Errors) =>
        submitted || touched[field] ? errors[field] : undefined;
    const dirty = !isEqual(draft, saved);

    const update = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
        setDraft((prev) => ({...prev, [key]: value}));
    };

    const handleAvatarChange = (file: File | null) => {
        // Side effects stay outside the state updater (StrictMode may call it twice).
        if (draft.avatar && draft.avatar.url !== saved.avatar?.url) {
            revokeIfBlob(draft.avatar);
        }
        const avatar: AvatarValue = file ? {file, url: URL.createObjectURL(file)} : null;
        setDraft((prev) => ({...prev, avatar}));
    };

    const handleNotificationChange = (key: NotificationKey, checked: boolean) => {
        setDraft((prev) => ({...prev, notifications: {...prev.notifications, [key]: checked}}));
    };

    const handleCancel = () => {
        if (draft.avatar && draft.avatar.url !== saved.avatar?.url) {
            revokeIfBlob(draft.avatar);
        }
        setDraft(saved);
        setTouched({});
        setSubmitted(false);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitted(true);
        if (Object.keys(errors).length > 0) {
            return;
        }

        setSaving(true);
        try {
            const normalized = {...draft, name: draft.name.trim(), email: draft.email.trim()};
            const result = await saveProfile(normalized);
            if (saved.avatar && saved.avatar.url !== result.avatar?.url) {
                revokeIfBlob(saved.avatar);
            }
            setSaved(result);
            setDraft(result);
            setTouched({});
            setSubmitted(false);
            toaster.add({
                name: 'profile-saved',
                theme: 'success',
                title: 'Настройки сохранены',
                autoHiding: 3000,
            });
        } catch {
            toaster.add({
                name: 'profile-save-error',
                theme: 'danger',
                title: 'Не удалось сохранить настройки',
                content: 'Проверьте соединение и попробуйте ещё раз',
            });
        } finally {
            setSaving(false);
        }
    };

    const rowClass = 'profile-settings__row';

    return (
        <form className="profile-settings" onSubmit={handleSubmit} noValidate>
            <Flex direction="column" gap={5} className="profile-settings__content">
                <Flex direction="column" gap={1}>
                    <Text as="h1" variant="header-1">
                        Настройки профиля
                    </Text>
                    <Text color="secondary">
                        Личные данные, параметры интерфейса и уведомления
                    </Text>
                </Flex>

                <Section title="Личные данные">
                    <FormRow
                        className={rowClass}
                        direction={rowDirection}
                        label="Аватар"
                        fieldId="profile-avatar"
                    >
                        <AvatarField
                            id="profile-avatar"
                            value={draft.avatar}
                            name={draft.name}
                            disabled={saving}
                            onChange={handleAvatarChange}
                        />
                    </FormRow>
                    <FormRow
                        className={rowClass}
                        direction={rowDirection}
                        label="Имя"
                        fieldId="profile-name"
                        required
                    >
                        <TextInput
                            id="profile-name"
                            name="name"
                            autoComplete="name"
                            value={draft.name}
                            onUpdate={(value) => update('name', value)}
                            onBlur={() => setTouched((prev) => ({...prev, name: true}))}
                            validationState={visibleError('name') ? 'invalid' : undefined}
                            errorMessage={visibleError('name')}
                            disabled={saving}
                        />
                    </FormRow>
                    <FormRow
                        className={rowClass}
                        direction={rowDirection}
                        label="Email"
                        fieldId="profile-email"
                        required
                    >
                        <TextInput
                            id="profile-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={draft.email}
                            onUpdate={(value) => update('email', value)}
                            onBlur={() => setTouched((prev) => ({...prev, email: true}))}
                            validationState={visibleError('email') ? 'invalid' : undefined}
                            errorMessage={visibleError('email')}
                            disabled={saving}
                        />
                    </FormRow>
                </Section>

                <Section title="Интерфейс">
                    <FormRow
                        className={rowClass}
                        direction={rowDirection}
                        label="Язык интерфейса"
                        fieldId="profile-language"
                    >
                        <Select
                            id="profile-language"
                            name="language"
                            width="max"
                            options={LANGUAGE_OPTIONS}
                            value={[draft.language]}
                            onUpdate={([value]) => value && update('language', value)}
                            disabled={saving}
                        />
                    </FormRow>
                    <FormRow
                        className={rowClass}
                        direction={rowDirection}
                        label="Часовой пояс"
                        fieldId="profile-timezone"
                    >
                        <Select
                            id="profile-timezone"
                            name="timeZone"
                            width="max"
                            filterable
                            filterPlaceholder="Город или UTC-смещение"
                            options={TIME_ZONE_OPTIONS}
                            value={[draft.timeZone]}
                            onUpdate={([value]) => value && update('timeZone', value)}
                            disabled={saving}
                        />
                        <FormRow.FieldDescription>
                            Используется для дат в отчётах и времени отправки дайджеста
                        </FormRow.FieldDescription>
                    </FormRow>
                </Section>

                <Section title="Безопасность">
                    <FormRow
                        className={rowClass}
                        direction={rowDirection}
                        label="Двухфакторная авторизация"
                        fieldId="profile-2fa"
                    >
                        <Switch
                            id="profile-2fa"
                            size="m"
                            checked={draft.twoFactor}
                            onUpdate={(checked) => update('twoFactor', checked)}
                            disabled={saving}
                            content={draft.twoFactor ? 'Включена' : 'Выключена'}
                        />
                        <FormRow.FieldDescription>
                            При входе дополнительно запрашивается код из приложения-аутентификатора
                        </FormRow.FieldDescription>
                    </FormRow>
                </Section>

                <Section title="Уведомления">
                    <FormRow className={rowClass} direction={rowDirection} label="Email-уведомления">
                        <Flex
                            direction="column"
                            gap={3}
                            role="group"
                            aria-label="Email-уведомления"
                        >
                            {NOTIFICATION_OPTIONS.map(({key, title, description}) => (
                                <Checkbox
                                    key={key}
                                    size="m"
                                    name={`notifications.${key}`}
                                    checked={draft.notifications[key]}
                                    onUpdate={(checked) => handleNotificationChange(key, checked)}
                                    disabled={saving}
                                >
                                    <Flex direction="column" gap={0.5}>
                                        <Text>{title}</Text>
                                        <Text variant="caption-2" color="secondary">
                                            {description}
                                        </Text>
                                    </Flex>
                                </Checkbox>
                            ))}
                        </Flex>
                    </FormRow>
                </Section>
            </Flex>

            <div className="profile-settings__footer">
                <Flex
                    className="profile-settings__content"
                    justifyContent="flex-end"
                    alignItems="center"
                    gap={2}
                >
                    {dirty && !saving && (
                        <Text color="secondary" className="profile-settings__hint">
                            Есть несохранённые изменения
                        </Text>
                    )}
                    <Button
                        view="normal"
                        size="l"
                        type="button"
                        onClick={handleCancel}
                        disabled={!dirty || saving}
                        style={{flexShrink: 0}}
                    >
                        Отмена
                    </Button>
                    <Button
                        view="action"
                        size="l"
                        type="submit"
                        loading={saving}
                        disabled={!dirty}
                        style={{flexShrink: 0}}
                    >
                        Сохранить
                    </Button>
                </Flex>
            </div>
        </form>
    );
}

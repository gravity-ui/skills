import * as React from 'react';
import {
    Alert,
    Avatar,
    Button,
    Card,
    Checkbox,
    Divider,
    Select,
    Switch,
    Text,
    TextInput,
    useFileInput,
} from '@gravity-ui/uikit';

import {
    LANGUAGE_OPTIONS,
    NOTIFICATION_OPTIONS,
    type NotificationKey,
    TIMEZONE_OPTIONS,
} from './profileOptions';
import './App.css';

type ProfileSettings = {
    name: string;
    email: string;
    /** data: URL выбранного изображения или null, если аватара нет */
    avatar: string | null;
    language: string;
    timezone: string;
    twoFactor: boolean;
    notifications: Record<NotificationKey, boolean>;
};

type Errors = Partial<Record<'name' | 'email' | 'avatar', string>>;

const AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Заглушка вместо данных с бэкенда.
const INITIAL_SETTINGS: ProfileSettings = {
    name: 'Алексей Смирнов',
    email: 'alexey@example.com',
    avatar: null,
    language: 'ru',
    timezone: 'Europe/Moscow',
    twoFactor: false,
    notifications: {
        productNews: true,
        systemAlerts: true,
        weeklyDigest: false,
    },
};

// Заглушка вместо запроса на сервер.
function saveProfile(settings: ProfileSettings): Promise<ProfileSettings> {
    return new Promise((resolve) => setTimeout(() => resolve(settings), 700));
}

function validate(values: ProfileSettings): Errors {
    const errors: Errors = {};
    if (!values.name.trim()) {
        errors.name = 'Укажите имя';
    }
    if (!values.email.trim()) {
        errors.email = 'Укажите email';
    } else if (!EMAIL_RE.test(values.email.trim())) {
        errors.email = 'Некорректный email';
    }
    return errors;
}

function getInitials(name: string) {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') || '?'
    );
}

function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function isEqual(a: ProfileSettings, b: ProfileSettings) {
    return JSON.stringify(a) === JSON.stringify(b);
}

type FieldProps = {
    label: string;
    htmlFor?: string;
    labelId?: string;
    hint?: React.ReactNode;
    children: React.ReactNode;
};

function Field({label, htmlFor, labelId, hint, children}: FieldProps) {
    return (
        <div className="profile-field">
            <label className="profile-field__label" htmlFor={htmlFor} id={labelId}>
                <Text variant="subheader-1">{label}</Text>
            </label>
            <div className="profile-field__control">
                {children}
                {hint && (
                    <Text as="div" variant="caption-2" color="secondary">
                        {hint}
                    </Text>
                )}
            </div>
        </div>
    );
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
    return (
        <section className="profile-section">
            <Text as="h2" variant="subheader-3" className="profile-section__title">
                {title}
            </Text>
            <div className="profile-section__body">{children}</div>
        </section>
    );
}

export function App() {
    const [saved, setSaved] = React.useState<ProfileSettings>(INITIAL_SETTINGS);
    const [values, setValues] = React.useState<ProfileSettings>(INITIAL_SETTINGS);
    const [touched, setTouched] = React.useState<Partial<Record<keyof Errors, boolean>>>({});
    const [submitAttempted, setSubmitAttempted] = React.useState(false);
    const [avatarError, setAvatarError] = React.useState<string | undefined>();
    const [saving, setSaving] = React.useState(false);
    const [status, setStatus] = React.useState<'saved' | null>(null);

    const errors = validate(values);
    const isDirty = !isEqual(values, saved);
    const hasErrors = Object.keys(errors).length > 0;
    const showError = (field: keyof Errors) =>
        touched[field] || submitAttempted ? errors[field] : undefined;

    const update = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
        setValues((prev) => ({...prev, [key]: value}));
        setStatus(null);
    };

    const toggleNotification = (key: NotificationKey, checked: boolean) => {
        setValues((prev) => ({
            ...prev,
            notifications: {...prev.notifications, [key]: checked},
        }));
        setStatus(null);
    };

    const handleAvatarFiles = React.useCallback(async (files: File[]) => {
        const file = files[0];
        if (!file) {
            return;
        }
        if (!AVATAR_TYPES.includes(file.type)) {
            setAvatarError('Поддерживаются PNG, JPG, WebP и GIF');
            return;
        }
        if (file.size > AVATAR_MAX_BYTES) {
            setAvatarError('Файл больше 5 МБ');
            return;
        }
        try {
            const dataUrl = await readAsDataUrl(file);
            setAvatarError(undefined);
            setValues((prev) => ({...prev, avatar: dataUrl}));
            setStatus(null);
        } catch {
            setAvatarError('Не удалось прочитать файл');
        }
    }, []);

    const {controlProps: fileControlProps, triggerProps: fileTriggerProps} = useFileInput({
        onUpdate: handleAvatarFiles,
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitAttempted(true);
        if (hasErrors || !isDirty || saving) {
            return;
        }
        setSaving(true);
        try {
            const normalized = {...values, name: values.name.trim(), email: values.email.trim()};
            const result = await saveProfile(normalized);
            setSaved(result);
            setValues(result);
            setTouched({});
            setSubmitAttempted(false);
            setStatus('saved');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setValues(saved);
        setTouched({});
        setSubmitAttempted(false);
        setAvatarError(undefined);
        setStatus(null);
    };

    return (
        <div className="profile-page">
            <form className="profile-form" onSubmit={handleSubmit} noValidate>
                <header className="profile-page__header">
                    <Text as="h1" variant="header-2">
                        Настройки профиля
                    </Text>
                    <Text as="p" color="secondary">
                        Личные данные, регион, безопасность и уведомления
                    </Text>
                </header>

                <Card view="outlined" className="profile-card">
                    <Section title="Основное">
                        <Field label="Аватар" hint="PNG, JPG, WebP или GIF, до 5 МБ">
                            <div className="profile-avatar">
                                {values.avatar ? (
                                    <Avatar
                                        size="xl"
                                        imgUrl={values.avatar}
                                        alt="Аватар пользователя"
                                    />
                                ) : (
                                    <Avatar
                                        size="xl"
                                        theme="brand"
                                        text={getInitials(values.name)}
                                        aria-label="Аватар не загружен"
                                    />
                                )}
                                <div className="profile-avatar__actions">
                                    <input
                                        {...fileControlProps}
                                        accept={AVATAR_TYPES.join(',')}
                                    />
                                    <Button view="outlined" {...fileTriggerProps}>
                                        {values.avatar ? 'Заменить фото' : 'Загрузить фото'}
                                    </Button>
                                    {values.avatar && (
                                        <Button
                                            view="flat-danger"
                                            onClick={() => {
                                                update('avatar', null);
                                                setAvatarError(undefined);
                                            }}
                                        >
                                            Удалить
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {avatarError && (
                                <Text as="div" variant="caption-2" color="danger" role="alert">
                                    {avatarError}
                                </Text>
                            )}
                        </Field>

                        <Field label="Имя" htmlFor="profile-name">
                            <TextInput
                                id="profile-name"
                                size="l"
                                value={values.name}
                                onUpdate={(v) => update('name', v)}
                                onBlur={() => setTouched((t) => ({...t, name: true}))}
                                autoComplete="name"
                                placeholder="Как к вам обращаться"
                                validationState={showError('name') ? 'invalid' : undefined}
                                errorMessage={showError('name')}
                            />
                        </Field>

                        <Field label="Email" htmlFor="profile-email">
                            <TextInput
                                id="profile-email"
                                type="email"
                                size="l"
                                value={values.email}
                                onUpdate={(v) => update('email', v)}
                                onBlur={() => setTouched((t) => ({...t, email: true}))}
                                autoComplete="email"
                                placeholder="name@example.com"
                                validationState={showError('email') ? 'invalid' : undefined}
                                errorMessage={showError('email')}
                            />
                        </Field>
                    </Section>

                    <Divider />

                    <Section title="Регион и язык">
                        <Field label="Язык интерфейса" htmlFor="profile-language">
                            <Select
                                id="profile-language"
                                size="l"
                                width="max"
                                options={LANGUAGE_OPTIONS}
                                value={[values.language]}
                                onUpdate={([v]) => v && update('language', v)}
                            />
                        </Field>

                        <Field label="Часовой пояс" htmlFor="profile-timezone">
                            <Select
                                id="profile-timezone"
                                size="l"
                                width="max"
                                filterable
                                filterPlaceholder="Поиск города"
                                options={TIMEZONE_OPTIONS}
                                value={[values.timezone]}
                                onUpdate={([v]) => v && update('timezone', v)}
                                renderEmptyOptions={() => (
                                    <Text
                                        as="div"
                                        color="secondary"
                                        className="profile-select-empty"
                                    >
                                        Ничего не найдено
                                    </Text>
                                )}
                            />
                        </Field>
                    </Section>

                    <Divider />

                    <Section title="Безопасность">
                        <div className="profile-toggle">
                            <div>
                                <Text as="div" variant="subheader-1" id="profile-2fa-label">
                                    Двухфакторная авторизация
                                </Text>
                                <Text as="div" variant="caption-2" color="secondary">
                                    При входе дополнительно потребуется код из приложения-аутентификатора
                                </Text>
                            </div>
                            <Switch
                                size="l"
                                checked={values.twoFactor}
                                onUpdate={(v) => update('twoFactor', v)}
                                controlProps={{'aria-labelledby': 'profile-2fa-label'}}
                            />
                        </div>
                    </Section>

                    <Divider />

                    <Section title="Email-уведомления">
                        <fieldset className="profile-checkboxes">
                            <legend className="profile-visually-hidden">
                                Какие письма получать
                            </legend>
                            {NOTIFICATION_OPTIONS.map((option) => (
                                <Checkbox
                                    key={option.key}
                                    size="l"
                                    checked={values.notifications[option.key]}
                                    onUpdate={(checked) => toggleNotification(option.key, checked)}
                                >
                                    <span className="profile-checkbox__text">
                                        <Text variant="body-2">{option.label}</Text>
                                        <Text variant="caption-2" color="secondary">
                                            {option.hint}
                                        </Text>
                                    </span>
                                </Checkbox>
                            ))}
                        </fieldset>
                    </Section>
                </Card>

                {status === 'saved' && (
                    <Alert
                        theme="success"
                        message="Изменения сохранены"
                        onClose={() => setStatus(null)}
                    />
                )}

                <div className="profile-actions">
                    <Button
                        type="submit"
                        view="action"
                        size="l"
                        loading={saving}
                        disabled={!isDirty}
                    >
                        Сохранить
                    </Button>
                    <Button
                        view="outlined"
                        size="l"
                        onClick={handleCancel}
                        disabled={!isDirty || saving}
                    >
                        Отмена
                    </Button>
                </div>
            </form>
        </div>
    );
}

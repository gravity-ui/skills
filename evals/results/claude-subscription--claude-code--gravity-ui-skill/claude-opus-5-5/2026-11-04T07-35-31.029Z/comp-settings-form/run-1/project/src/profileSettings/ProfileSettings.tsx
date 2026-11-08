import * as React from 'react';
import {FormRow} from '@gravity-ui/components';
import {
    Alert,
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
    useLayoutContext,
} from '@gravity-ui/uikit';

import {
    LANGUAGE_OPTIONS,
    NOTIFICATION_OPTIONS,
    TIMEZONE_OPTIONS,
    type NotificationKey,
} from './options';
import './ProfileSettings.css';

export interface ProfileValues {
    name: string;
    email: string;
    /** URL of the current avatar (remote URL or a local object URL for a not-yet-saved file). */
    avatarUrl: string | null;
    language: string;
    timezone: string;
    twoFactorEnabled: boolean;
    notifications: Record<NotificationKey, boolean>;
}

const DEFAULT_PROFILE: ProfileValues = {
    name: 'Анна Смирнова',
    email: 'anna.smirnova@example.com',
    avatarUrl: null,
    language: 'ru',
    timezone: 'Europe/Moscow',
    twoFactorEnabled: false,
    notifications: {productNews: true, systemAlerts: true, weeklyDigest: false},
};

const AVATAR_MAX_SIZE_MB = 5;
const AVATAR_ACCEPT = 'image/png,image/jpeg,image/webp';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<'name' | 'email', string>>;
type SaveStatus = {type: 'success' | 'error'; message: string} | null;

function validate(values: ProfileValues): FieldErrors {
    const errors: FieldErrors = {};
    const name = values.name.trim();
    if (!name) {
        errors.name = 'Укажите имя';
    } else if (name.length > 100) {
        errors.name = 'Имя не должно быть длиннее 100 символов';
    }
    const email = values.email.trim();
    if (!email) {
        errors.email = 'Укажите email';
    } else if (!EMAIL_RE.test(email)) {
        errors.email = 'Некорректный email';
    }
    return errors;
}

function isEqualProfile(a: ProfileValues, b: ProfileValues) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function getInitials(name: string) {
    const initials = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
    return initials || '?';
}

/** Stand-in for a real API call. */
function saveProfile(_values: ProfileValues, _avatarFile: File | null): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 800));
}

export interface ProfileSettingsProps {
    initialValues?: ProfileValues;
    onSave?: (values: ProfileValues, avatarFile: File | null) => Promise<void>;
    onCancel?: () => void;
}

export function ProfileSettings({
    initialValues = DEFAULT_PROFILE,
    onSave = saveProfile,
    onCancel,
}: ProfileSettingsProps) {
    const {isMediaActive} = useLayoutContext();
    const rowDirection = isMediaActive('m') ? 'row' : 'column';

    const [saved, setSaved] = React.useState<ProfileValues>(initialValues);
    const [values, setValues] = React.useState<ProfileValues>(initialValues);
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
    const [avatarError, setAvatarError] = React.useState<string | null>(null);
    const [touched, setTouched] = React.useState<Record<'name' | 'email', boolean>>({
        name: false,
        email: false,
    });
    const [submitAttempted, setSubmitAttempted] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [status, setStatus] = React.useState<SaveStatus>(null);

    const errors = validate(values);
    const isDirty = !isEqualProfile(values, saved);
    const visibleError = (field: 'name' | 'email') =>
        touched[field] || submitAttempted ? errors[field] : undefined;

    // Object URLs created for local avatar previews; released when discarded or on unmount.
    const objectUrlsRef = React.useRef(new Set<string>());
    React.useEffect(() => {
        const urls = objectUrlsRef.current;
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
            urls.clear();
        };
    }, []);
    const releaseUrl = (url: string | null, keep: Array<string | null> = []) => {
        if (url && objectUrlsRef.current.has(url) && !keep.includes(url)) {
            URL.revokeObjectURL(url);
            objectUrlsRef.current.delete(url);
        }
    };

    const update = <K extends keyof ProfileValues>(key: K, value: ProfileValues[K]) => {
        setValues((prev) => ({...prev, [key]: value}));
        setStatus(null);
    };

    const handleAvatarFiles = (files: File[]) => {
        const file = files[0];
        if (!file) {
            return;
        }
        if (!AVATAR_ACCEPT.split(',').includes(file.type)) {
            setAvatarError('Поддерживаются только PNG, JPEG и WebP');
            return;
        }
        if (file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024) {
            setAvatarError(`Файл больше ${AVATAR_MAX_SIZE_MB} МБ`);
            return;
        }
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.add(url);
        releaseUrl(values.avatarUrl, [saved.avatarUrl]);
        setAvatarError(null);
        setAvatarFile(file);
        update('avatarUrl', url);
    };

    const {controlProps: fileControlProps, triggerProps: fileTriggerProps} = useFileInput({
        onUpdate: handleAvatarFiles,
    });

    const handleRemoveAvatar = () => {
        releaseUrl(values.avatarUrl, [saved.avatarUrl]);
        setAvatarFile(null);
        setAvatarError(null);
        update('avatarUrl', null);
    };

    const handleCancel = () => {
        releaseUrl(values.avatarUrl, [saved.avatarUrl]);
        setValues(saved);
        setAvatarFile(null);
        setAvatarError(null);
        setTouched({name: false, email: false});
        setSubmitAttempted(false);
        setStatus(null);
        onCancel?.();
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitAttempted(true);
        if (Object.keys(errors).length > 0 || !isDirty || saving) {
            return;
        }

        const normalized: ProfileValues = {
            ...values,
            name: values.name.trim(),
            email: values.email.trim(),
        };

        setSaving(true);
        setStatus(null);
        try {
            await onSave(normalized, avatarFile);
            // The preview URL is now the saved avatar; the previously saved one is no longer used.
            releaseUrl(saved.avatarUrl, [normalized.avatarUrl]);
            setSaved(normalized);
            setValues(normalized);
            setAvatarFile(null);
            setTouched({name: false, email: false});
            setSubmitAttempted(false);
            setStatus({type: 'success', message: 'Изменения сохранены'});
        } catch {
            setStatus({
                type: 'error',
                message: 'Не удалось сохранить изменения. Попробуйте ещё раз.',
            });
        } finally {
            setSaving(false);
        }
    };

    const setNotification = (key: NotificationKey, checked: boolean) => {
        update('notifications', {...values.notifications, [key]: checked});
    };

    return (
        <div className="profile-settings">
            <Flex direction="column" gap={1} className="profile-settings__header">
                <Text variant="header-1" as="h1">
                    Настройки профиля
                </Text>
                <Text color="secondary">
                    Личные данные, региональные настройки, безопасность и уведомления
                </Text>
            </Flex>

            <Card view="outlined" className="profile-settings__card">
                <form noValidate onSubmit={handleSubmit}>
                    <Box className="profile-settings__body">
                        <section className="profile-settings__section">
                            <Text variant="subheader-3" as="h2" className="profile-settings__section-title">
                                Основное
                            </Text>

                            <FormRow label="Аватар" direction={rowDirection}>
                                <Flex alignItems="center" gap={4} className="profile-settings__avatar">
                                    {values.avatarUrl ? (
                                        <Avatar
                                            size="xl"
                                            imgUrl={values.avatarUrl}
                                            alt="Аватар пользователя"
                                            style={{flexShrink: 0}}
                                        />
                                    ) : (
                                        <Avatar
                                            size="xl"
                                            theme="brand"
                                            text={getInitials(values.name)}
                                            aria-label="Аватар пользователя"
                                            style={{flexShrink: 0}}
                                        />
                                    )}
                                    <Flex direction="column" gap={2} style={{flex: 1, minWidth: 0}}>
                                        <Flex gap={2} wrap>
                                            <input
                                                {...fileControlProps}
                                                accept={AVATAR_ACCEPT}
                                                aria-label="Файл аватара"
                                            />
                                            <Button view="outlined" type="button" {...fileTriggerProps}>
                                                {values.avatarUrl ? 'Заменить фото' : 'Загрузить фото'}
                                            </Button>
                                            {values.avatarUrl && (
                                                <Button
                                                    view="flat-secondary"
                                                    type="button"
                                                    onClick={handleRemoveAvatar}
                                                >
                                                    Удалить
                                                </Button>
                                            )}
                                        </Flex>
                                        {avatarError ? (
                                            <Text variant="caption-2" color="danger" role="alert">
                                                {avatarError}
                                            </Text>
                                        ) : (
                                            <Text variant="caption-2" color="secondary">
                                                PNG, JPEG или WebP, до {AVATAR_MAX_SIZE_MB} МБ
                                            </Text>
                                        )}
                                    </Flex>
                                </Flex>
                            </FormRow>

                            <FormRow label="Имя" fieldId="profile-name" required direction={rowDirection}>
                                <TextInput
                                    id="profile-name"
                                    name="name"
                                    autoComplete="name"
                                    placeholder="Как к вам обращаться"
                                    value={values.name}
                                    onUpdate={(value) => update('name', value)}
                                    onBlur={() => setTouched((prev) => ({...prev, name: true}))}
                                    validationState={visibleError('name') ? 'invalid' : undefined}
                                    errorMessage={visibleError('name')}
                                />
                            </FormRow>

                            <FormRow label="Email" fieldId="profile-email" required direction={rowDirection}>
                                <TextInput
                                    id="profile-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="name@example.com"
                                    value={values.email}
                                    onUpdate={(value) => update('email', value)}
                                    onBlur={() => setTouched((prev) => ({...prev, email: true}))}
                                    validationState={visibleError('email') ? 'invalid' : undefined}
                                    errorMessage={visibleError('email')}
                                />
                            </FormRow>
                        </section>

                        <Divider />

                        <section className="profile-settings__section">
                            <Text variant="subheader-3" as="h2" className="profile-settings__section-title">
                                Язык и регион
                            </Text>

                            <FormRow label="Язык интерфейса" fieldId="profile-language" direction={rowDirection}>
                                <Select
                                    id="profile-language"
                                    name="language"
                                    width="max"
                                    options={LANGUAGE_OPTIONS}
                                    value={[values.language]}
                                    onUpdate={([language]) => language && update('language', language)}
                                />
                            </FormRow>

                            <FormRow label="Часовой пояс" fieldId="profile-timezone" direction={rowDirection}>
                                <Select
                                    id="profile-timezone"
                                    name="timezone"
                                    width="max"
                                    filterable
                                    filterPlaceholder="Поиск города или зоны"
                                    options={TIMEZONE_OPTIONS}
                                    value={[values.timezone]}
                                    onUpdate={([timezone]) => timezone && update('timezone', timezone)}
                                />
                            </FormRow>
                        </section>

                        <Divider />

                        <section className="profile-settings__section">
                            <Text variant="subheader-3" as="h2" className="profile-settings__section-title">
                                Безопасность
                            </Text>

                            <FormRow
                                label="Двухфакторная авторизация"
                                fieldId="profile-2fa"
                                direction={rowDirection}
                            >
                                <Switch
                                    id="profile-2fa"
                                    size="m"
                                    checked={values.twoFactorEnabled}
                                    onUpdate={(checked) => update('twoFactorEnabled', checked)}
                                    content={values.twoFactorEnabled ? 'Включена' : 'Выключена'}
                                />
                                <FormRow.FieldDescription>
                                    При входе потребуется код из приложения-аутентификатора
                                </FormRow.FieldDescription>
                            </FormRow>
                        </section>

                        <Divider />

                        <section className="profile-settings__section">
                            <Text variant="subheader-3" as="h2" className="profile-settings__section-title">
                                Уведомления
                            </Text>

                            <FormRow label="Email-уведомления" direction={rowDirection}>
                                <Flex
                                    direction="column"
                                    gap={3}
                                    role="group"
                                    aria-label="Email-уведомления"
                                    className="profile-settings__checkboxes"
                                >
                                    {NOTIFICATION_OPTIONS.map(({key, title, description}) => (
                                        <Checkbox
                                            key={key}
                                            size="m"
                                            name={`notifications.${key}`}
                                            checked={values.notifications[key]}
                                            onUpdate={(checked) => setNotification(key, checked)}
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
                        </section>
                    </Box>

                    <Divider />

                    <Flex
                        className="profile-settings__footer"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={3}
                        wrap
                    >
                        <div className="profile-settings__status" aria-live="polite">
                            {status && (
                                <Alert
                                    theme={status.type === 'success' ? 'success' : 'danger'}
                                    view="filled"
                                    size="s"
                                    layout="horizontal"
                                    message={status.message}
                                    onClose={() => setStatus(null)}
                                />
                            )}
                        </div>
                        <Flex gap={2} className="profile-settings__actions">
                            <Button
                                view="normal"
                                size="l"
                                type="button"
                                disabled={!isDirty || saving}
                                onClick={handleCancel}
                            >
                                Отмена
                            </Button>
                            <Button
                                view="action"
                                size="l"
                                type="submit"
                                loading={saving}
                                disabled={!isDirty}
                            >
                                Сохранить
                            </Button>
                        </Flex>
                    </Flex>
                </form>
            </Card>
        </div>
    );
}

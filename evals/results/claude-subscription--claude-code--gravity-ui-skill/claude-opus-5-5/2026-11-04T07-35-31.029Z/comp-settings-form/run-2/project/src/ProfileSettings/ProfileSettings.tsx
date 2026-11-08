import * as React from 'react';

import {FormRow} from '@gravity-ui/components';
import {ArrowUpFromLine, Person, TrashBin} from '@gravity-ui/icons';
import {
    Avatar,
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
    useLayoutContext,
} from '@gravity-ui/uikit';

import {
    LANGUAGE_OPTIONS,
    NOTIFICATION_OPTIONS,
    type NotificationKey,
    TIMEZONE_OPTIONS,
} from './options';

import './ProfileSettings.css';

export interface ProfileFormValues {
    name: string;
    email: string;
    /** Remote URL or a `blob:` object URL of a freshly picked file */
    avatarUrl: string | null;
    language: string;
    timezone: string;
    twoFactorEnabled: boolean;
    notifications: Record<NotificationKey, boolean>;
}

export interface ProfileSettingsProps {
    initialValues: ProfileFormValues;
    /** Persists the values. The avatar file is passed separately when it was replaced. */
    onSave: (values: ProfileFormValues, avatarFile: File | null) => Promise<void>;
}

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const AVATAR_ACCEPT = 'image/png,image/jpeg,image/webp';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<'name' | 'email', string>>;

function validate(values: ProfileFormValues): Errors {
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

function isEqualValues(a: ProfileFormValues, b: ProfileFormValues) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function revokeIfBlob(url: string | null) {
    if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
}

export function ProfileSettings({initialValues, onSave}: ProfileSettingsProps) {
    const id = React.useId();
    const fieldId = (name: string) => `${id}-${name}`;

    const {isMediaActive} = useLayoutContext();
    const rowProps = {
        direction: isMediaActive('m') ? ('row' as const) : ('column' as const),
        className: 'profile-settings__row',
    };

    const [saved, setSaved] = React.useState(initialValues);
    const [values, setValues] = React.useState(initialValues);
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
    const [avatarError, setAvatarError] = React.useState<string | null>(null);
    const [submitAttempted, setSubmitAttempted] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [status, setStatus] = React.useState<{type: 'success' | 'error'; text: string} | null>(
        null,
    );

    const errors = validate(values);
    const showErrors = submitAttempted;
    const dirty = !isEqualValues(values, saved);

    // Release a draft object URL once it is no longer displayed or saved.
    const latest = React.useRef({values, saved});
    latest.current = {values, saved};
    React.useEffect(
        () => () => {
            const {values: v, saved: s} = latest.current;
            if (v.avatarUrl !== s.avatarUrl) {
                revokeIfBlob(v.avatarUrl);
            }
        },
        [],
    );

    const update = <K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) => {
        setStatus(null);
        setValues((prev) => ({...prev, [key]: value}));
    };

    const replaceAvatar = (nextUrl: string | null, file: File | null) => {
        if (values.avatarUrl !== saved.avatarUrl) {
            revokeIfBlob(values.avatarUrl);
        }
        setAvatarFile(file);
        update('avatarUrl', nextUrl);
    };

    const handleFiles = (files: File[]) => {
        const file = files[0];
        if (!file) {
            return;
        }
        if (!AVATAR_ACCEPT.split(',').includes(file.type)) {
            setAvatarError('Поддерживаются только JPG, PNG и WebP');
            return;
        }
        if (file.size > AVATAR_MAX_SIZE) {
            setAvatarError('Файл больше 5 МБ');
            return;
        }
        setAvatarError(null);
        replaceAvatar(URL.createObjectURL(file), file);
    };

    const {controlProps: fileControlProps, triggerProps: fileTriggerProps} = useFileInput({
        onUpdate: handleFiles,
    });

    const handleCancel = () => {
        if (values.avatarUrl !== saved.avatarUrl) {
            revokeIfBlob(values.avatarUrl);
        }
        setValues(saved);
        setAvatarFile(null);
        setAvatarError(null);
        setSubmitAttempted(false);
        setStatus(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitAttempted(true);
        if (Object.keys(errors).length > 0 || !dirty) {
            return;
        }

        const next = {...values, name: values.name.trim(), email: values.email.trim()};
        setSaving(true);
        setStatus(null);
        try {
            await onSave(next, avatarFile);
            if (saved.avatarUrl !== next.avatarUrl) {
                revokeIfBlob(saved.avatarUrl);
            }
            setSaved(next);
            setValues(next);
            setAvatarFile(null);
            setSubmitAttempted(false);
            setStatus({type: 'success', text: 'Изменения сохранены'});
        } catch {
            setStatus({type: 'error', text: 'Не удалось сохранить изменения. Попробуйте ещё раз.'});
        } finally {
            setSaving(false);
        }
    };

    const avatarProps = values.avatarUrl
        ? ({imgUrl: values.avatarUrl, alt: 'Аватар'} as const)
        : values.name.trim()
          ? ({text: values.name.trim()} as const)
          : ({icon: Person} as const);

    return (
        <form className="profile-settings" onSubmit={handleSubmit} noValidate>
            <Flex direction="column" gap={1} className="profile-settings__header">
                <Text variant="header-1" as="h1">
                    Настройки профиля
                </Text>
                <Text color="secondary">Личные данные, предпочтения и безопасность аккаунта</Text>
            </Flex>

            <Card view="outlined" spacing={{p: 6}}>
                <Flex direction="column" gap={6}>
                    <section>
                        <Text variant="subheader-3" as="h2" className="profile-settings__section-title">
                            Профиль
                        </Text>

                        <FormRow label="Аватар" fieldId={fieldId('avatar')} {...rowProps}>
                            <Flex gap={4} alignItems="center">
                                <Avatar
                                    {...avatarProps}
                                    size="xl"
                                    theme="brand"
                                    style={{flexShrink: 0}}
                                />
                                <Flex direction="column" gap={2} style={{minWidth: 0}}>
                                    <Flex gap={2} wrap>
                                        <input
                                            {...fileControlProps}
                                            accept={AVATAR_ACCEPT}
                                            aria-label="Файл аватара"
                                        />
                                        <Button
                                            {...fileTriggerProps}
                                            id={fieldId('avatar')}
                                            view="outlined"
                                            disabled={saving}
                                        >
                                            <Icon data={ArrowUpFromLine} size={16} />
                                            {values.avatarUrl ? 'Заменить фото' : 'Загрузить фото'}
                                        </Button>
                                        {values.avatarUrl && (
                                            <Button
                                                view="flat-danger"
                                                disabled={saving}
                                                onClick={() => {
                                                    setAvatarError(null);
                                                    replaceAvatar(null, null);
                                                }}
                                            >
                                                <Icon data={TrashBin} size={16} />
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
                                            JPG, PNG или WebP, не больше 5 МБ
                                        </Text>
                                    )}
                                </Flex>
                            </Flex>
                        </FormRow>

                        <FormRow label="Имя" fieldId={fieldId('name')} required {...rowProps}>
                            <TextInput
                                id={fieldId('name')}
                                value={values.name}
                                onUpdate={(value) => update('name', value)}
                                placeholder="Как к вам обращаться"
                                autoComplete="name"
                                disabled={saving}
                                validationState={showErrors && errors.name ? 'invalid' : undefined}
                                errorMessage={errors.name}
                            />
                        </FormRow>

                        <FormRow label="Email" fieldId={fieldId('email')} required {...rowProps}>
                            <TextInput
                                id={fieldId('email')}
                                type="email"
                                value={values.email}
                                onUpdate={(value) => update('email', value)}
                                placeholder="name@example.com"
                                autoComplete="email"
                                disabled={saving}
                                validationState={showErrors && errors.email ? 'invalid' : undefined}
                                errorMessage={errors.email}
                            />
                        </FormRow>
                    </section>

                    <Divider />

                    <section>
                        <Text variant="subheader-3" as="h2" className="profile-settings__section-title">
                            Региональные настройки
                        </Text>

                        <FormRow
                            label="Язык интерфейса"
                            fieldId={fieldId('language')}
                            {...rowProps}
                        >
                            <Select
                                id={fieldId('language')}
                                width="max"
                                options={LANGUAGE_OPTIONS}
                                value={[values.language]}
                                onUpdate={([value]) => value && update('language', value)}
                                disabled={saving}
                            />
                        </FormRow>

                        <FormRow
                            label="Часовой пояс"
                            fieldId={fieldId('timezone')}
                            {...rowProps}
                        >
                            <Select
                                id={fieldId('timezone')}
                                width="max"
                                filterable
                                filterPlaceholder="Город или UTC-смещение"
                                options={TIMEZONE_OPTIONS}
                                value={[values.timezone]}
                                onUpdate={([value]) => value && update('timezone', value)}
                                disabled={saving}
                            />
                        </FormRow>
                    </section>

                    <Divider />

                    <section>
                        <Text variant="subheader-3" as="h2" className="profile-settings__section-title">
                            Безопасность и уведомления
                        </Text>

                        <FormRow
                            label="Двухфакторная авторизация"
                            fieldId={fieldId('2fa')}
                            {...rowProps}
                        >
                            <Switch
                                id={fieldId('2fa')}
                                checked={values.twoFactorEnabled}
                                onUpdate={(checked) => update('twoFactorEnabled', checked)}
                                disabled={saving}
                                content={values.twoFactorEnabled ? 'Включена' : 'Выключена'}
                            />
                            <FormRow.FieldDescription>
                                При входе потребуется код из приложения-аутентификатора
                            </FormRow.FieldDescription>
                        </FormRow>

                        <FormRow label="Email-уведомления" {...rowProps}>
                            <Flex
                                direction="column"
                                gap={3}
                                role="group"
                                aria-label="Email-уведомления"
                                className="profile-settings__checkbox-group"
                            >
                                {NOTIFICATION_OPTIONS.map(({key, title, hint}) => (
                                    <Checkbox
                                        key={key}
                                        checked={values.notifications[key]}
                                        onUpdate={(checked) =>
                                            update('notifications', {
                                                ...values.notifications,
                                                [key]: checked,
                                            })
                                        }
                                        disabled={saving}
                                        content={
                                            <Flex direction="column" gap={0.5}>
                                                <Text>{title}</Text>
                                                <Text variant="caption-2" color="secondary">
                                                    {hint}
                                                </Text>
                                            </Flex>
                                        }
                                    />
                                ))}
                            </Flex>
                        </FormRow>
                    </section>
                </Flex>
            </Card>

            <Flex
                gap={2}
                alignItems="center"
                justifyContent="flex-end"
                wrap
                className="profile-settings__footer"
            >
                {status && (
                    <Text
                        role="status"
                        color={status.type === 'success' ? 'positive' : 'danger'}
                        className="profile-settings__status"
                    >
                        {status.text}
                    </Text>
                )}
                <Button size="l" view="normal" onClick={handleCancel} disabled={!dirty || saving}>
                    Отмена
                </Button>
                <Button size="l" view="action" type="submit" loading={saving} disabled={!dirty}>
                    Сохранить
                </Button>
            </Flex>
        </form>
    );
}

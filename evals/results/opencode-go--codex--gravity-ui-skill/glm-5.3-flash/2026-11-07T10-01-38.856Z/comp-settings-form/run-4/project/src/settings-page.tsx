import { useCallback, useMemo, useRef, useState } from 'react';

import { FormRow } from '@gravity-ui/components';
import {
    Avatar,
    Button,
    Card,
    Checkbox,
    Flex,
    Select,
    Switch,
    Text,
    TextInput,
    sp,
} from '@gravity-ui/uikit';

import type { ProfileSettings, ProfileSettingsErrors } from './settings-types';

const languages = ['Русский', 'English', 'Deutsch'] as const;

const timezones = [
    'UTC',
    'UTC+01:00 — Берлин',
    'UTC+03:00 — Москва',
    'UTC−08:00 — Лос-Анджелес',
] as const;

const notificationOptions = [
    { id: 'productNews', label: 'Новости продукта' },
    { id: 'systemAlerts', label: 'Системные алерты' },
    { id: 'weeklyDigest', label: 'Дайджест за неделю' },
] as const satisfies ReadonlyArray<{ id: keyof ProfileSettings['notifications']; label: string }>;

const initialSettings: ProfileSettings = {
    name: '',
    email: '',
    avatarFileName: null,
    avatarPreviewUrl: null,
    language: 'Русский',
    timezone: 'UTC',
    twoFactorEnabled: false,
    notifications: {
        productNews: true,
        systemAlerts: true,
        weeklyDigest: false,
    },
};

export function SettingsPage({
    initialProfileSettings = initialSettings,
    onSave,
}: SettingsPageProps) {
    const [settings, setSettings] = useState<ProfileSettings>(initialProfileSettings);
    const [errors, setErrors] = useState<ProfileSettingsErrors>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const displayName = settings.name.trim();
    const initials = useMemo(() => {
        const parts = displayName.split(/\s+/).filter(Boolean);

        return parts.length > 1 ? `${parts[0][0]}${parts.at(-1)?.[0] ?? ''}` : displayName.slice(0, 1);
    }, [displayName]);

    const validate = useCallback((candidate: ProfileSettings) => {
        const nextErrors: ProfileSettingsErrors = {};

        if (!candidate.name.trim()) {
            nextErrors.name = 'Укажите имя';
        }

        if (!candidate.email.trim()) {
            nextErrors.email = 'Укажите email';
        } else if (!/^\S+@\S+\.\S+$/.test(candidate.email)) {
            nextErrors.email = 'Некорректный email';
        }

        return nextErrors;
    }, []);

    const updateLanguage = useCallback((values: string[]) => {
        setSettings((previous) => ({ ...previous, language: values[0] ?? '' }));
    }, []);

    const updateTimezone = useCallback((values: string[]) => {
        setSettings((previous) => ({ ...previous, timezone: values[0] ?? '' }));
    }, []);

    const updateNotification = useCallback(
        (notification: keyof ProfileSettings['notifications'], checked: boolean) => {
            setSettings((previous) => ({
                ...previous,
                notifications: {
                    ...previous.notifications,
                    [notification]: checked,
                },
            }));
        },
        [],
    );

    const clearAvatar = useCallback(() => {
        if (settings.avatarPreviewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(settings.avatarPreviewUrl);
        }

        setSettings((previous) => ({
            ...previous,
            avatarFileName: null,
            avatarPreviewUrl: null,
        }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [settings.avatarPreviewUrl]);

    const resetForm = useCallback(() => {
        const currentAvatarPreviewUrl = settings.avatarPreviewUrl;

        setSettings(initialProfileSettings);
        setErrors({});

        if (currentAvatarPreviewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(currentAvatarPreviewUrl);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [initialProfileSettings, settings.avatarPreviewUrl]);

    const handleSave = useCallback(() => {
        const nextErrors = validate(settings);

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        onSave?.(settings);
    }, [onSave, settings, validate]);

    const selectedLanguage = useMemo(
        () => (settings.language ? [settings.language] : []),
        [settings.language],
    );
    const selectedTimezone = useMemo(
        () => (settings.timezone ? [settings.timezone] : []),
        [settings.timezone],
    );

    return (
        <Card className="profile-settings">
            <Flex direction="column" gap={6}>
                <Flex direction="column" gap={1}>
                    <Text variant="header-1">Настройки профиля</Text>
                    <Text variant="body-1" color="secondary">
                        Управляйте личными данными, безопасностью и уведомлениями.
                    </Text>
                </Flex>

                <form
                    className="profile-settings__form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSave();
                    }}
                >
                    <Flex direction="column" gap={5}>
                        <FormRow label="Имя" required fieldId="profile-name">
                            <TextInput
                                id="profile-name"
                                value={settings.name}
                                onUpdate={(value) =>
                                    setSettings((previous) => ({ ...previous, name: value }))
                                }
                                error={errors.name}
                                errorMessage={errors.name}
                                errorPlacement="outside"
                                placeholder="Введите имя"
                                validationState={errors.name ? 'invalid' : undefined}
                            />
                        </FormRow>

                        <FormRow label="Email" required fieldId="profile-email">
                            <TextInput
                                id="profile-email"
                                type="email"
                                value={settings.email}
                                onUpdate={(value) =>
                                    setSettings((previous) => ({ ...previous, email: value }))
                                }
                                error={errors.email}
                                errorMessage={errors.email}
                                errorPlacement="outside"
                                placeholder="user@example.com"
                                validationState={errors.email ? 'invalid' : undefined}
                            />
                        </FormRow>

                        <FormRow label="Аватар" fieldId="profile-avatar-upload">
                            <Flex alignItems="center" gap={4}>
                                {settings.avatarPreviewUrl ? (
                                    <Avatar
                                        imgUrl={settings.avatarPreviewUrl}
                                        size="xl"
                                        className="profile-settings__avatar"
                                    />
                                ) : (
                                    <Avatar
                                        text={initials || '—'}
                                        size="xl"
                                        className="profile-settings__avatar"
                                    />
                                )}

                                <Flex direction="column" gap={2}>
                                    <Flex gap={2}>
                                        <Button
                                            size="m"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Загрузить файл
                                        </Button>
                                        <Button
                                            size="m"
                                            view="flat-secondary"
                                            disabled={!settings.avatarFileName}
                                            onClick={clearAvatar}
                                        >
                                            Удалить
                                        </Button>
                                    </Flex>
                                    <Text variant="caption-2" color="secondary">
                                        {settings.avatarFileName ?? 'PNG или JPEG, до 5 МБ'}
                                    </Text>
                                </Flex>
                            </Flex>

                            <input
                                ref={fileInputRef}
                                id="profile-avatar-upload"
                                className="profile-settings__file-input"
                                type="file"
                                accept="image/png,image/jpeg"
                                onChange={(event) => {
                                    const file = event.target.files?.[0];

                                    if (!file) {
                                        return;
                                    }

                                    if (file.size > 5 * 1024 * 1024) {
                                        setErrors((previous) => ({ ...previous, avatar: 'Файл больше 5 МБ' }));
                                        return;
                                    }

                                    const previousUrl = settings.avatarPreviewUrl;
                                    const previewUrl = URL.createObjectURL(file);
                                    setSettings((previous) => ({
                                        ...previous,
                                        avatarFileName: file.name,
                                        avatarPreviewUrl: previewUrl,
                                    }));
                                    setErrors((previous) => ({ ...previous, avatar: undefined }));

                                    if (previousUrl?.startsWith('blob:')) {
                                        URL.revokeObjectURL(previousUrl);
                                    }
                                }}
                            />
                            {errors.avatar ? (
                                <Text variant="caption-2" color="danger">
                                    {errors.avatar}
                                </Text>
                            ) : null}
                        </FormRow>

                        <FormRow label="Язык интерфейса" fieldId="profile-language">
                            <Select
                                id="profile-language"
                                value={selectedLanguage}
                                onUpdate={updateLanguage}
                                placeholder="Выберите язык"
                                width="max"
                                options={languages.map((language) => ({
                                    value: language,
                                    content: language,
                                }))}
                            />
                        </FormRow>

                        <FormRow label="Часовой пояс" fieldId="profile-timezone">
                            <Select
                                id="profile-timezone"
                                value={selectedTimezone}
                                onUpdate={updateTimezone}
                                placeholder="Выберите часовой пояс"
                                width="max"
                                options={timezones.map((timezone) => ({
                                    value: timezone,
                                    content: timezone,
                                }))}
                            />
                        </FormRow>

                        <FormRow label="Двухфакторная авторизация" fieldId="profile-two-factor">
                            <Switch
                                id="profile-two-factor"
                                checked={settings.twoFactorEnabled}
                                onUpdate={(checked) =>
                                    setSettings((previous) => ({
                                        ...previous,
                                        twoFactorEnabled: checked,
                                    }))
                                }
                            />
                        </FormRow>

                        <FormRow label="Email-уведомления">
                            <Flex direction="column" gap={2}>
                                {notificationOptions.map(({ id, label }) => (
                                    <Checkbox
                                        key={id}
                                        id={`profile-notifications-${id}`}
                                        checked={settings.notifications[id]}
                                        onUpdate={(checked) => updateNotification(id, checked)}
                                    >
                                        {label}
                                    </Checkbox>
                                ))}
                            </Flex>
                        </FormRow>
                    </Flex>
                </form>

                <Flex gap={3} className={sp({ mt: 2 })}>
                    <Button view="action" size="m" onClick={handleSave}>
                        Сохранить
                    </Button>
                    <Button view="flat-secondary" size="m" onClick={resetForm}>
                        Отмена
                    </Button>
                </Flex>
            </Flex>
        </Card>
    );
}

type SettingsPageProps = {
    initialProfileSettings?: ProfileSettings;
    onSave?: (settings: ProfileSettings) => void;
};

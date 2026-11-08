// Implement the requested feature here (and may add sibling files).
import React from 'react';

import { Avatar, Button, Checkbox, Flex, Select, Switch, TextInput } from '@gravity-ui/uikit';
import { toaster } from '@gravity-ui/uikit/toaster-singleton';

interface ProfileFormData {
    name: string;
    email: string;
    avatar: File | undefined;
    avatarUrl: string;
    language: string;
    timezone: string;
    twoFactorEnabled: boolean;
    emailNotifications: {
        productNews: boolean;
        systemAlerts: boolean;
        weeklyDigest: boolean;
    };
}

const initialFormData: ProfileFormData = {
    name: 'Иван Петров',
    email: 'ivan@example.com',
    avatar: undefined,
    avatarUrl: '',
    language: 'ru',
    timezone: 'UTC+03:00',
    twoFactorEnabled: false,
    emailNotifications: {
        productNews: true,
        systemAlerts: true,
        weeklyDigest: false,
    },
};

const languageOptions = [
    { value: 'ru', content: 'Русский' },
    { value: 'en', content: 'English' },
    { value: 'de', content: 'Deutsch' },
];

const timezoneOptions = [
    { value: 'UTC-08:00', content: 'UTC−08:00' },
    { value: 'UTC+00:00', content: 'UTC+00:00' },
    { value: 'UTC+03:00', content: 'UTC+03:00' },
    { value: 'UTC+09:00', content: 'UTC+09:00' },
];

export function App() {
    const [formData, setFormData] = React.useState(initialFormData);
    const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({});

    const resetFormData = React.useCallback(() => {
        setFormData(initialFormData);
        setErrors({});
    }, []);

    const validate = (data: ProfileFormData) => {
        const validationErrors: typeof errors = {};

        if (!data.name.trim()) {
            validationErrors.name = 'Укажите имя';
        }
        if (!data.email.trim()) {
            validationErrors.email = 'Укажите email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            validationErrors.email = 'Введите корректный email';
        }

        return validationErrors;
    };

    const handleSave = () => {
        const validationErrors = validate(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            void toaster.add({
                name: 'profile-saved',
                title: 'Профиль сохранён',
                theme: 'success',
            });
        }
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setFormData((current) => ({
            ...current,
            avatar: file,
            avatarUrl: file ? URL.createObjectURL(file) : '',
        }));
    };

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--g-color-base-simple)', padding: 24 }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
                <h1 style={{ margin: '0 0 24px' }}>Настройки профиля</h1>
                <section style={{ backgroundColor: 'var(--g-color-base-background)', borderRadius: 12, padding: 24 }}>
                        <Flex direction="column" gap="5">
                        <TextInput
                            label="Имя"
                            value={formData.name}
                            error={errors.name}
                            onUpdate={(value) => setFormData((current) => ({ ...current, name: value }))}
                        />
                        <TextInput
                            label="Email"
                            type="email"
                            value={formData.email}
                            error={errors.email}
                            onUpdate={(value) => setFormData((current) => ({ ...current, email: value }))}
                        />
                        <Flex direction="column" gap="3">
                            <label htmlFor="profile-avatar">Аватар</label>
                                <Flex gap="3" alignItems="center">
                                {formData.avatarUrl ? (
                                    <Avatar imgUrl={formData.avatarUrl} size="l" />
                                ) : (
                                    <Avatar text={formData.name || '?'} size="l" />
                                )}
                                <input
                                    id="profile-avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                            </Flex>
                        </Flex>
                        <Select
                            label="Язык интерфейса"
                            value={[formData.language]}
                            options={languageOptions}
                            width="max"
                            onUpdate={([value]) => setFormData((current) => ({ ...current, language: value }))}
                        />
                        <Select
                            label="Часовой пояс"
                            value={[formData.timezone]}
                            options={timezoneOptions}
                            width="max"
                            onUpdate={([value]) => setFormData((current) => ({ ...current, timezone: value }))}
                        />
                        <Flex direction="column" gap="3">
                            <Switch
                                checked={formData.twoFactorEnabled}
                                onUpdate={(checked) => setFormData((current) => ({ ...current, twoFactorEnabled: checked }))}
                            >
                                Двухфакторная авторизация
                            </Switch>
                            <Checkbox
                                checked={formData.emailNotifications.productNews}
                                onUpdate={(checked) => setFormData((current) => ({
                                    ...current,
                                    emailNotifications: { ...current.emailNotifications, productNews: checked },
                                }))}
                            >
                                Новости продукта
                            </Checkbox>
                            <Checkbox
                                checked={formData.emailNotifications.systemAlerts}
                                onUpdate={(checked) => setFormData((current) => ({
                                    ...current,
                                    emailNotifications: { ...current.emailNotifications, systemAlerts: checked },
                                }))}
                            >
                                Системные алерты
                            </Checkbox>
                            <Checkbox
                                checked={formData.emailNotifications.weeklyDigest}
                                onUpdate={(checked) => setFormData((current) => ({
                                    ...current,
                                    emailNotifications: { ...current.emailNotifications, weeklyDigest: checked },
                                }))}
                            >
                                Дайджест за неделю
                            </Checkbox>
                        </Flex>
                        <Flex gap="3">
                            <Button view="action" size="m" onClick={handleSave}>Сохранить</Button>
                            <Button view="normal" size="m" onClick={resetFormData}>Отмена</Button>
                        </Flex>
                    </Flex>
                </section>
            </div>
        </main>
    );
}

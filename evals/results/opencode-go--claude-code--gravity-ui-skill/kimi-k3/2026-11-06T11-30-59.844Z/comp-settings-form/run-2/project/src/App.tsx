import React from 'react';
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
    sp,
} from '@gravity-ui/uikit';
import {Camera} from '@gravity-ui/icons';

const LANGUAGES = [
    {value: 'ru', content: 'Русский'},
    {value: 'en', content: 'English'},
    {value: 'de', content: 'Deutsch'},
    {value: 'fr', content: 'Français'},
    {value: 'es', content: 'Español'},
    {value: 'zh', content: '中文'},
];

const TIMEZONES = [
    {value: 'Europe/Kaliningrad', content: 'Калининград (GMT+2)'},
    {value: 'Europe/Moscow', content: 'Москва (GMT+3)'},
    {value: 'Europe/Samara', content: 'Самара (GMT+4)'},
    {value: 'Asia/Yekaterinburg', content: 'Екатеринбург (GMT+5)'},
    {value: 'Asia/Novosibirsk', content: 'Новосибирск (GMT+7)'},
    {value: 'Asia/Vladivostok', content: 'Владивосток (GMT+10)'},
    {value: 'Europe/London', content: 'Лондон (GMT+0)'},
    {value: 'Europe/Berlin', content: 'Берлин (GMT+1)'},
    {value: 'America/New_York', content: 'Нью-Йорк (GMT−5)'},
];

interface Notifications {
    productNews: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
}

interface ProfileSettings {
    name: string;
    email: string;
    avatarUrl: string | null;
    language: string;
    timezone: string;
    twoFactor: boolean;
    notifications: Notifications;
}

const INITIAL_SETTINGS: ProfileSettings = {
    name: 'Анна Смирнова',
    email: 'anna.smirnova@example.com',
    avatarUrl: null,
    language: 'ru',
    timezone: 'Europe/Moscow',
    twoFactor: true,
    notifications: {
        productNews: true,
        systemAlerts: true,
        weeklyDigest: false,
    },
};

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

function Field({label, children}: {label: string; children: React.ReactNode}) {
    return (
        <Flex direction="column" gap={2}>
            <Text variant="subheader-1">{label}</Text>
            {children}
        </Flex>
    );
}

export function App() {
    const [saved, setSaved] = React.useState<ProfileSettings>(INITIAL_SETTINGS);
    const [form, setForm] = React.useState<ProfileSettings>(INITIAL_SETTINGS);
    const [showSaved, setShowSaved] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const patch = (changes: Partial<ProfileSettings>) => {
        setShowSaved(false);
        setForm((prev) => ({...prev, ...changes}));
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            patch({avatarUrl: URL.createObjectURL(file)});
        }
        event.target.value = '';
    };

    const handleSave = () => {
        setSaved(form);
        setShowSaved(true);
    };

    const handleCancel = () => {
        setForm(saved);
        setShowSaved(false);
    };

    return (
        <Box
            style={{
                minHeight: '100vh',
                background: 'var(--g-color-base-background)',
            }}
            spacing={{py: 8}}
        >
            <Flex
                direction="column"
                gap={6}
                className={sp({px: 4})}
                style={{maxWidth: 680, margin: '0 auto'}}
            >
                <Text variant="header-1">Настройки профиля</Text>

                <Card type="container" spacing={{p: 6}}>
                    <Flex direction="column" gap={6}>
                        {/* Аватар */}
                        <Field label="Аватар">
                            <Flex alignItems="center" gap={4}>
                                <div style={{flexShrink: 0}}>
                                    <Avatar
                                        size="xl"
                                        {...(form.avatarUrl
                                            ? {imgUrl: form.avatarUrl, alt: form.name}
                                            : {text: getInitials(form.name) || '?', theme: 'brand'})}
                                    />
                                </div>
                                <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
                                    <div>
                                        <Button
                                            view="outlined"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Icon data={Camera} size={16} />
                                            Загрузить фото
                                        </Button>
                                    </div>
                                    <Text variant="caption-1" color="secondary">
                                        PNG или JPG, до 5&nbsp;МБ
                                    </Text>
                                </Flex>
                            </Flex>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg"
                                hidden
                                onChange={handleAvatarChange}
                            />
                        </Field>

                        <Divider />

                        {/* Имя и email */}
                        <Field label="Имя">
                            <TextInput
                                value={form.name}
                                onUpdate={(name) => patch({name})}
                                placeholder="Ваше имя"
                                hasClear
                            />
                        </Field>

                        <Field label="Email">
                            <TextInput
                                type="email"
                                value={form.email}
                                onUpdate={(email) => patch({email})}
                                placeholder="you@example.com"
                                hasClear
                            />
                        </Field>

                        <Divider />

                        {/* Локализация */}
                        <Field label="Язык интерфейса">
                            <Select
                                value={[form.language]}
                                onUpdate={([language]) => patch({language})}
                                options={LANGUAGES}
                                width="max"
                            />
                        </Field>

                        <Field label="Часовой пояс">
                            <Select
                                value={[form.timezone]}
                                onUpdate={([timezone]) => patch({timezone})}
                                options={TIMEZONES}
                                width="max"
                            />
                        </Field>

                        <Divider />

                        {/* Безопасность */}
                        <Field label="Безопасность">
                            <Switch
                                checked={form.twoFactor}
                                onUpdate={(twoFactor) => patch({twoFactor})}
                            >
                                Двухфакторная авторизация
                            </Switch>
                        </Field>

                        {/* Уведомления */}
                        <Field label="Email-уведомления">
                            <Flex direction="column" gap={2}>
                                <Checkbox
                                    checked={form.notifications.productNews}
                                    onUpdate={(checked) =>
                                        patch({
                                            notifications: {
                                                ...form.notifications,
                                                productNews: checked,
                                            },
                                        })
                                    }
                                >
                                    Новости продукта
                                </Checkbox>
                                <Checkbox
                                    checked={form.notifications.systemAlerts}
                                    onUpdate={(checked) =>
                                        patch({
                                            notifications: {
                                                ...form.notifications,
                                                systemAlerts: checked,
                                            },
                                        })
                                    }
                                >
                                    Системные алерты
                                </Checkbox>
                                <Checkbox
                                    checked={form.notifications.weeklyDigest}
                                    onUpdate={(checked) =>
                                        patch({
                                            notifications: {
                                                ...form.notifications,
                                                weeklyDigest: checked,
                                            },
                                        })
                                    }
                                >
                                    Дайджест за неделю
                                </Checkbox>
                            </Flex>
                        </Field>
                    </Flex>
                </Card>

                {/* Действия */}
                <Flex alignItems="center" gap={3}>
                    <Button view="action" size="l" onClick={handleSave}>
                        Сохранить
                    </Button>
                    <Button view="flat" size="l" onClick={handleCancel}>
                        Отмена
                    </Button>
                    {showSaved ? (
                        <Text variant="body-2" color="positive" style={{flexShrink: 0}}>
                            Изменения сохранены
                        </Text>
                    ) : null}
                </Flex>
            </Flex>
        </Box>
    );
}

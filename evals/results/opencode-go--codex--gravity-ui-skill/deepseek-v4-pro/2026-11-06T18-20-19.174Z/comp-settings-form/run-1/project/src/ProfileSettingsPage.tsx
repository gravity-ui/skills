import {useMemo, useState} from 'react';
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
} from '@gravity-ui/uikit';
import {ArrowUpFromLine, CircleCheck, Person} from '@gravity-ui/icons';

const LANGUAGE_OPTIONS = [
    {value: 'ru', content: 'Русский'},
    {value: 'en', content: 'English'},
];

const TIME_ZONE_OPTIONS = [
    {value: 'moscow', content: '(UTC+3) Москва'},
    {value: 'novosibirsk', content: '(UTC+7) Новосибирск'},
    {value: 'yekaterinburg', content: '(UTC+5) Екатеринбург'},
    {value: 'kaliningrad', content: '(UTC+2) Калининград'},
];

const EMAIL_NOTIFICATION_OPTIONS = [
    {key: 'productNews', label: 'Новости продукта'},
    {key: 'systemAlerts', label: 'Системные алерты'},
    {key: 'weeklyDigest', label: 'Дайджест за неделю'},
] as const;

type EmailNotifKey = (typeof EMAIL_NOTIFICATION_OPTIONS)[number]['key'];

interface ProfileForm {
    name: string;
    email: string;
    avatarUrl: string | null;
    language: 'ru' | 'en';
    timeZone: 'moscow' | 'novosibirsk' | 'yekaterinburg' | 'kaliningrad';
    twoFactorEnabled: boolean;
    emailNotifications: Record<EmailNotifKey, boolean>;
}

const INITIAL_FORM: ProfileForm = {
    name: 'Александра Иванова',
    email: 'a.ivanova@example.com',
    avatarUrl: null,
    language: 'ru',
    timeZone: 'moscow',
    twoFactorEnabled: false,
    emailNotifications: {
        productNews: true,
        systemAlerts: true,
        weeklyDigest: false,
    },
};

/* ------------------------------------------------------------------ */
/*  lightweight field wrapper (label + optional description + children) */
/* ------------------------------------------------------------------ */
function FieldShell({label, description, children}: {label: string; description?: string; children: React.ReactNode}) {
    return (
        <Box>
            <Text variant="subheader-2" as="div">
                {label}
            </Text>
            {description ? (
                <Text variant="body-1" color="secondary" as="div" style={{marginTop: 'var(--g-spacing-1)'}}>
                    {description}
                </Text>
            ) : null}
            <Box style={{marginTop: 'var(--g-spacing-3)'}}>{children}</Box>
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/*  page component                                                      */
/* ------------------------------------------------------------------ */
export function ProfileSettingsPage() {
    const [form, setForm] = useState<ProfileForm>(INITIAL_FORM);
    const [saved, setSaved] = useState(false);

    const setField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
        setForm((prev) => ({...prev, [key]: value}));
        setSaved(false);
    };

    /* ---------- file upload ---------- */
    const {controlProps: fileControl, triggerProps: fileTrigger} = useFileInput({
        onUpdate: ([first]) => {
            if (first) {
                setField('avatarUrl', URL.createObjectURL(first));
            }
        },
    });

    /* ---------- avatar rendering ---------- */
    const avatarComponent = useMemo(() => {
        if (form.avatarUrl) {
            return <Avatar imgUrl={form.avatarUrl} size="xl" alt={form.name} />;
        }
        return <Avatar icon={Person} size="xl" />;
    }, [form.avatarUrl, form.name]);

    /* ---------- handlers ---------- */
    const handleCancel = () => {
        setForm(INITIAL_FORM);
        setSaved(false);
    };

    return (
        <Box style={{minHeight: '100vh', padding: 'var(--g-spacing-10)'}}>
            <Box style={{maxWidth: 720, margin: '0 auto'}}>
                {/* ---- page heading ---- */}
                <Text variant="header-1" as="h1">
                    Настройки профиля
                </Text>
                <Text variant="body-1" color="secondary" as="p" style={{marginTop: 'var(--g-spacing-2)'}}>
                    Управляйте личными данными, языком и уведомлениями.
                </Text>

                {/* ---- success banner ---- */}
                {saved ? (
                    <Flex
                        alignItems="center"
                        gap={2}
                        style={{
                            marginTop: 'var(--g-spacing-4)',
                            padding: 'var(--g-spacing-4)',
                            borderRadius: 'var(--g-border-radius-m)',
                            background: 'var(--g-color-base-positive-light)',
                        }}
                    >
                        <Icon data={CircleCheck} size={16} color="positive" />
                        <Text variant="body-1" color="positive">
                            Изменения сохранены
                        </Text>
                    </Flex>
                ) : null}

                {/* ---- form card ---- */}
                <Card type="container" view="outlined" style={{marginTop: 'var(--g-spacing-6)'}}>
                    <Box style={{padding: 'var(--g-spacing-6)'}}>
                        <Flex direction="column" gap={6}>
                            <FieldShell label="Имя">
                                <TextInput
                                    size="l"
                                    value={form.name}
                                    onUpdate={(v) => setField('name', v)}
                                    placeholder="Введите имя"
                                />
                            </FieldShell>

                            <FieldShell label="Email">
                                <TextInput
                                    size="l"
                                    type="email"
                                    value={form.email}
                                    onUpdate={(v) => setField('email', v)}
                                    placeholder="you@example.com"
                                />
                            </FieldShell>

                            <FieldShell
                                label="Аватар"
                                description="JPG или PNG, не более 5 МБ."
                            >
                                <Flex alignItems="center" gap={4}>
                                    <Box style={{flexShrink: 0}}>{avatarComponent}</Box>
                                    <Box style={{display: 'none'}}>
                                        <input type="file" accept="image/jpeg,image/png" {...fileControl} />
                                    </Box>
                                    <Button view="normal" size="l" {...fileTrigger}>
                                        <Button.Icon side="left">
                                            <Icon data={ArrowUpFromLine} size={16} />
                                        </Button.Icon>
                                        Загрузить фото
                                    </Button>
                                </Flex>
                            </FieldShell>

                            <FieldShell label="Язык интерфейса">
                                <Select
                                    size="l"
                                    value={[form.language]}
                                    options={LANGUAGE_OPTIONS}
                                    onUpdate={([v]) => setField('language', v as 'ru' | 'en')}
                                />
                            </FieldShell>

                            <FieldShell label="Часовой пояс">
                                <Select
                                    size="l"
                                    value={[form.timeZone]}
                                    options={TIME_ZONE_OPTIONS}
                                    onUpdate={([v]) =>
                                        setField(
                                            'timeZone',
                                            v as 'moscow' | 'novosibirsk' | 'yekaterinburg' | 'kaliningrad',
                                        )
                                    }
                                />
                            </FieldShell>
                        </Flex>

                        <Divider style={{marginTop: 'var(--g-spacing-6)'}} />

                        <Flex direction="column" gap={6} style={{marginTop: 'var(--g-spacing-6)'}}>
                            <FieldShell
                                label="Безопасность"
                                description="Дополнительная защита аккаунта при входе."
                            >
                                <Switch
                                    size="l"
                                    checked={form.twoFactorEnabled}
                                    onUpdate={(checked) => setField('twoFactorEnabled', checked)}
                                >
                                    Двухфакторная авторизация
                                </Switch>
                            </FieldShell>

                            <FieldShell label="Email-уведомления">
                                <Flex direction="column" gap={3}>
                                    {EMAIL_NOTIFICATION_OPTIONS.map((opt) => (
                                        <Checkbox
                                            key={opt.key}
                                            size="l"
                                            checked={form.emailNotifications[opt.key]}
                                            onUpdate={(checked) =>
                                                setField('emailNotifications', {
                                                    ...form.emailNotifications,
                                                    [opt.key]: checked,
                                                })
                                            }
                                        >
                                            {opt.label}
                                        </Checkbox>
                                    ))}
                                </Flex>
                            </FieldShell>
                        </Flex>

                        <Divider style={{marginTop: 'var(--g-spacing-6)'}} />

                        <Flex gap={3} justifyContent="flex-end" style={{marginTop: 'var(--g-spacing-6)'}}>
                            <Button view="outlined" size="l" onClick={handleCancel}>
                                Отмена
                            </Button>
                            <Button view="action" size="l" onClick={() => setSaved(true)}>
                                Сохранить
                            </Button>
                        </Flex>
                    </Box>
                </Card>
            </Box>
        </Box>
    );
}

import {useState} from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    Checkbox,
    Container,
    Flex,
    Select,
    Switch,
    Text,
    TextInput,
} from '@gravity-ui/uikit';

type FormData = {
    name: string;
    email: string;
    language: string[];
    timezone: string[];
    twoFactor: boolean;
    notifyProductNews: boolean;
    notifySystemAlerts: boolean;
    notifyWeeklyDigest: boolean;
};

const LANGUAGES = [
    {value: 'en', content: 'English'},
    {value: 'ru', content: 'Русский'},
    {value: 'de', content: 'Deutsch'},
    {value: 'fr', content: 'Français'},
];

const TIMEZONES = [
    {value: 'UTC', content: 'UTC'},
    {value: 'Europe/Moscow', content: 'Europe/Moscow (GMT+3)'},
    {value: 'Europe/London', content: 'Europe/London (GMT+0)'},
    {value: 'America/New_York', content: 'America/New_York (GMT-5)'},
    {value: 'Asia/Tokyo', content: 'Asia/Tokyo (GMT+9)'},
];

export function App() {
    const [form, setForm] = useState<FormData>({
        name: '',
        email: '',
        language: ['en'],
        timezone: ['UTC'],
        twoFactor: false,
        notifyProductNews: true,
        notifySystemAlerts: true,
        notifyWeeklyDigest: false,
    });

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const handleAvatarUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                setAvatarUrl(URL.createObjectURL(file));
            }
        };
        input.click();
    };

    const handleSave = () => {
        console.log('Saved:', form);
    };

    const handleCancel = () => {
        setForm({
            name: '',
            email: '',
            language: ['en'],
            timezone: ['UTC'],
            twoFactor: false,
            notifyProductNews: true,
            notifySystemAlerts: true,
            notifyWeeklyDigest: false,
        });
        setAvatarUrl(null);
    };

    return (
        <Container maxWidth="m">
            <Box spacing={{mt: 6, mb: 4}}>
                <Text variant="header-1">Profile Settings</Text>
            </Box>

            <Card view="outlined" type="container">
                <Box spacing={{p: 6}}>
                    {/* Avatar */}
                    <Flex direction="column" gap={3}>
                        <Text variant="subheader-2">Avatar</Text>
                        <Flex alignItems="center" gap={4}>
                            <Avatar
                                size="xl"
                                imgUrl={avatarUrl ?? undefined}
                                text={form.name || '?'}
                            />
                            <Button view="normal" onClick={handleAvatarUpload}>
                                Upload
                            </Button>
                            {avatarUrl && (
                                <Button
                                    view="flat-danger"
                                    onClick={() => setAvatarUrl(null)}
                                >
                                    Remove
                                </Button>
                            )}
                        </Flex>
                    </Flex>

                    {/* Name */}
                    <Box spacing={{mt: 5}}>
                        <TextInput
                            label="Name:"
                            value={form.name}
                            onUpdate={(value) =>
                                setForm((prev) => ({...prev, name: value}))
                            }
                            placeholder="Enter your name"
                        />
                    </Box>

                    {/* Email */}
                    <Box spacing={{mt: 3}}>
                        <TextInput
                            label="Email:"
                            type="email"
                            value={form.email}
                            onUpdate={(value) =>
                                setForm((prev) => ({...prev, email: value}))
                            }
                            placeholder="Enter your email"
                        />
                    </Box>

                    {/* Language */}
                    <Box spacing={{mt: 3}}>
                        <Select
                            label="Interface language:"
                            value={form.language}
                            onUpdate={(value) =>
                                setForm((prev) => ({...prev, language: value}))
                            }
                            options={LANGUAGES}
                        />
                    </Box>

                    {/* Timezone */}
                    <Box spacing={{mt: 3}}>
                        <Select
                            label="Timezone:"
                            value={form.timezone}
                            onUpdate={(value) =>
                                setForm((prev) => ({...prev, timezone: value}))
                            }
                            options={TIMEZONES}
                            filterable
                        />
                    </Box>

                    {/* Two-factor auth */}
                    <Box spacing={{mt: 5}}>
                        <Switch
                            checked={form.twoFactor}
                            onUpdate={(checked) =>
                                setForm((prev) => ({...prev, twoFactor: checked}))
                            }
                        >
                            Two-factor authentication
                        </Switch>
                    </Box>

                    {/* Email notifications */}
                    <Box spacing={{mt: 5}}>
                        <Text variant="subheader-2">Email notifications</Text>
                        <Box spacing={{mt: 3}}>
                            <Flex direction="column" gap={3}>
                                <Checkbox
                                    checked={form.notifyProductNews}
                                    onUpdate={(checked) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            notifyProductNews: checked,
                                        }))
                                    }
                                    size="l"
                                >
                                    Product news
                                </Checkbox>
                                <Checkbox
                                    checked={form.notifySystemAlerts}
                                    onUpdate={(checked) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            notifySystemAlerts: checked,
                                        }))
                                    }
                                    size="l"
                                >
                                    System alerts
                                </Checkbox>
                                <Checkbox
                                    checked={form.notifyWeeklyDigest}
                                    onUpdate={(checked) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            notifyWeeklyDigest: checked,
                                        }))
                                    }
                                    size="l"
                                >
                                    Weekly digest
                                </Checkbox>
                            </Flex>
                        </Box>
                    </Box>

                    {/* Buttons */}
                    <Box spacing={{mt: 6}}>
                        <Flex gap={3}>
                            <Button view="action" size="l" onClick={handleSave}>
                                Save
                            </Button>
                            <Button view="normal" size="l" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </Flex>
                    </Box>
                </Box>
            </Card>
        </Container>
    );
}

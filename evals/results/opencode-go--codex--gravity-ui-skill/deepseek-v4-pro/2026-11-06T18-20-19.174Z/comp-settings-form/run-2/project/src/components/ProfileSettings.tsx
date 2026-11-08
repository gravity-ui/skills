import * as React from 'react';
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
} from '@gravity-ui/uikit';
import {
  CloudArrowUpIn,
  Envelope,
  FloppyDisk,
  Person,
  Xmark,
} from '@gravity-ui/icons';
import { unstable_FileDropZone as FileDropZone } from '@gravity-ui/uikit/unstable';

type EmailNotificationId = 'product' | 'system' | 'weekly';

const LANGUAGES = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
];

const TIMEZONES = [
  { value: 'Europe/Moscow', content: 'Москва (UTC+3)' },
  { value: 'Europe/Berlin', content: 'Берлин (UTC+1)' },
  { value: 'Europe/London', content: 'Лондон (UTC+0)' },
  { value: 'Asia/Yekaterinburg', content: 'Екатеринбург (UTC+5)' },
];

export function ProfileSettings() {
  const [name, setName] = React.useState('Алексей Смирнов');
  const [email, setEmail] = React.useState('alexey@example.com');
  const [language, setLanguage] = React.useState(['ru']);
  const [timezone, setTimezone] = React.useState(['Europe/Moscow']);
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Record<EmailNotificationId, boolean>>({
    product: true,
    system: false,
    weekly: true,
  });
  const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>();

  const toggleNotification = (id: EmailNotificationId) => {
    setNotifications((current) => ({ ...current, [id]: !current[id] }));
  };

  const handleAvatarUpload = (files: File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }

    if (avatarUrl) {
      URL.revokeObjectURL(avatarUrl);
    }

    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleCancel = () => {
    setName('Алексей Смирнов');
    setEmail('alexey@example.com');
    setLanguage(['ru']);
    setTimezone(['Europe/Moscow']);
    setTwoFactorEnabled(false);
    setNotifications({ product: true, system: false, weekly: true });
    setAvatarUrl(undefined);
  };

  return (
    <Box
      spacing={{ px: 4, py: 6 }}
      width="100%"
      minHeight="100vh"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}
    >
      <Card type="container" view="raised" style={{ width: '100%', maxWidth: 720 }}>
        <Box spacing={{ px: 8, py: 7 }}>
          <Text variant="header-1" as="h1" color="primary">
            Настройки профиля
          </Text>

          <Box spacing={{ mt: 6 }}>
            <Flex direction="column" gap={6}>
              <Flex gap={6} alignItems="center" wrap>
                <Avatar
                  size="xl"
                  shape="circle"
                  {...(avatarUrl
                    ? { imgUrl: avatarUrl, alt: 'Аватар пользователя' }
                    : { icon: Person, alt: 'Аватар по умолчанию' })}
                />

                <Box minWidth={260} width="100%" style={{ maxWidth: 340 }}>
                  <Text variant="subheader-2" as="div" color="primary">
                    Аватар
                  </Text>
                  <Text variant="body-1" color="secondary" style={{ marginBottom: 12 }}>
                    JPG, PNG или GIF. Не более 5 МБ.
                  </Text>
                  <FileDropZone
                    accept={['image/jpeg', 'image/png', 'image/gif']}
                    onUpdateAccepted={handleAvatarUpload}
                    title="Перетащите изображение сюда"
                    description="или нажмите, чтобы выбрать файл"
                    buttonText="Выбрать файл"
                    icon={CloudArrowUpIn}
                  />
                </Box>
              </Flex>

              <Flex direction="column" gap={4}>
                <Flex direction="column" gap={2}>
                  <Text variant="subheader-2" as="label" htmlFor="profile-name" color="primary">
                    Имя
                  </Text>
                  <TextInput
                    id="profile-name"
                    size="l"
                    value={name}
                    onUpdate={setName}
                    placeholder="Введите имя"
                  />
                </Flex>

                <Flex direction="column" gap={2}>
                  <Text variant="subheader-2" as="label" htmlFor="profile-email" color="primary">
                    Email
                  </Text>
                  <TextInput
                    id="profile-email"
                    size="l"
                    type="email"
                    value={email}
                    onUpdate={setEmail}
                    placeholder="Введите email"
                    startContent={<Icon data={Envelope} size={16} />}
                  />
                </Flex>
              </Flex>

              <Divider />

              <Flex direction="column" gap={4}>
                <Flex direction="column" gap={2}>
                  <Text variant="subheader-2" as="div" color="primary">
                    Язык интерфейса
                  </Text>
                  <Select size="l" value={language} onUpdate={setLanguage} options={LANGUAGES} />
                </Flex>

                <Flex direction="column" gap={2}>
                  <Text variant="subheader-2" as="div" color="primary">
                    Часовой пояс
                  </Text>
                  <Select
                    size="l"
                    value={timezone}
                    onUpdate={setTimezone}
                    options={TIMEZONES}
                  />
                </Flex>
              </Flex>

              <Divider />

              <Flex direction="column" gap={4}>
                <Switch
                  size="m"
                  checked={twoFactorEnabled}
                  onUpdate={setTwoFactorEnabled}
                >
                  Двухфакторная авторизация
                </Switch>

                <Flex direction="column" gap={2}>
                  <Text variant="subheader-2" as="div" color="primary">
                    Email-уведомления
                  </Text>
                  <Checkbox
                    size="m"
                    checked={notifications.product}
                    onUpdate={() => toggleNotification('product')}
                  >
                    Новости продукта
                  </Checkbox>
                  <Checkbox
                    size="m"
                    checked={notifications.system}
                    onUpdate={() => toggleNotification('system')}
                  >
                    Системные алерты
                  </Checkbox>
                  <Checkbox
                    size="m"
                    checked={notifications.weekly}
                    onUpdate={() => toggleNotification('weekly')}
                  >
                    Дайджест за неделю
                  </Checkbox>
                </Flex>
              </Flex>
            </Flex>
          </Box>

          <Divider />

          <Flex gap={3} justifyContent="flex-end" style={{ marginTop: 24 }}>
            <Button size="l" view="outlined" onClick={handleCancel}>
              <Button.Icon side="left">
                <Icon data={Xmark} size={16} />
              </Button.Icon>
              Отмена
            </Button>
            <Button size="l" view="action" onClick={() => console.log('saved')}>
              <Button.Icon side="left">
                <Icon data={FloppyDisk} size={16} />
              </Button.Icon>
              Сохранить
            </Button>
          </Flex>
        </Box>
      </Card>
    </Box>
  );
}

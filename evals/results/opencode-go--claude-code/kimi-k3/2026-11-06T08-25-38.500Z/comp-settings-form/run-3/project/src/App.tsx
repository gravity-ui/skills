import React from 'react';
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
} from '@gravity-ui/uikit';

const LANGUAGES = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'es', content: 'Español' },
  { value: 'zh', content: '中文' },
];

const TIMEZONES = [
  { value: 'Europe/Kaliningrad', content: 'Калининград (UTC+2)' },
  { value: 'Europe/Moscow', content: 'Москва (UTC+3)' },
  { value: 'Europe/Samara', content: 'Самара (UTC+4)' },
  { value: 'Asia/Yekaterinburg', content: 'Екатеринбург (UTC+5)' },
  { value: 'Asia/Novosibirsk', content: 'Новосибирск (UTC+7)' },
  { value: 'Asia/Vladivostok', content: 'Владивосток (UTC+10)' },
  { value: 'Europe/London', content: 'Лондон (UTC+0)' },
  { value: 'Europe/Berlin', content: 'Берлин (UTC+1)' },
  { value: 'America/New_York', content: 'Нью-Йорк (UTC−5)' },
  { value: 'Asia/Tokyo', content: 'Токио (UTC+9)' },
];

interface FormState {
  name: string;
  email: string;
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifyProduct: boolean;
  notifyAlerts: boolean;
  notifyDigest: boolean;
}

const initialState: FormState = {
  name: 'Иван Петров',
  email: 'ivan.petrov@example.com',
  avatarUrl: null,
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: false,
  notifyProduct: true,
  notifyAlerts: true,
  notifyDigest: false,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Flex direction="column" gap={2}>
      <Text variant="subheader-2" as="label">
        {label}
      </Text>
      {children}
    </Flex>
  );
}

export function App() {
  const [form, setForm] = React.useState<FormState>(initialState);
  const [saved, setSaved] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const patch = (partial: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => patch({ avatarUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Здесь был бы запрос к API
    setSaved(true);
  };

  const handleCancel = () => {
    setForm(initialState);
    setSaved(false);
  };

  return (
    <Flex justifyContent="center" style={{ padding: 24 }}>
      <Card
        style={{ width: '100%', maxWidth: 640, padding: 24 }}
        view="raised"
        type="container"
      >
        <Flex direction="column" gap={6}>
          <Text variant="header-1">Настройки профиля</Text>

          <Field label="Имя">
            <TextInput
              value={form.name}
              onUpdate={(value) => patch({ name: value })}
              placeholder="Введите имя"
              size="l"
            />
          </Field>

          <Field label="Email">
            <TextInput
              value={form.email}
              onUpdate={(value) => patch({ email: value })}
              placeholder="you@example.com"
              type="email"
              size="l"
            />
          </Field>

          <Field label="Аватар">
            <Flex alignItems="center" gap={4}>
              <Avatar
                size="l"
                text={form.name || '?'}
                imgUrl={form.avatarUrl ?? undefined}
                theme="brand"
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                Загрузить фото
              </Button>
              {form.avatarUrl && (
                <Button view="flat" onClick={() => patch({ avatarUrl: null })}>
                  Удалить
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </Flex>
          </Field>

          <Field label="Язык интерфейса">
            <Select
              value={[form.language]}
              onUpdate={(value) => patch({ language: value[0] ?? '' })}
              options={LANGUAGES}
              size="l"
              width="max"
            />
          </Field>

          <Field label="Часовой пояс">
            <Select
              value={[form.timezone]}
              onUpdate={(value) => patch({ timezone: value[0] ?? '' })}
              options={TIMEZONES}
              size="l"
              width="max"
              filterable
            />
          </Field>

          <Flex alignItems="center" gap={3}>
            <Switch
              checked={form.twoFactor}
              onUpdate={(checked) => patch({ twoFactor: checked })}
              size="l"
            />
            <Text variant="subheader-2">Двухфакторная авторизация</Text>
          </Flex>

          <Flex direction="column" gap={2}>
            <Text variant="subheader-2">Email-уведомления</Text>
            <Checkbox
              checked={form.notifyProduct}
              onUpdate={(checked) => patch({ notifyProduct: checked })}
              content="Новости продукта"
              size="l"
            />
            <Checkbox
              checked={form.notifyAlerts}
              onUpdate={(checked) => patch({ notifyAlerts: checked })}
              content="Системные алерты"
              size="l"
            />
            <Checkbox
              checked={form.notifyDigest}
              onUpdate={(checked) => patch({ notifyDigest: checked })}
              content="Дайджест за неделю"
              size="l"
            />
          </Flex>

          <Flex gap={3} alignItems="center">
            <Button view="action" size="l" onClick={handleSave}>
              Сохранить
            </Button>
            <Button view="flat" size="l" onClick={handleCancel}>
              Отмена
            </Button>
            {saved && (
              <Text variant="body-2" color="positive">
                Изменения сохранены
              </Text>
            )}
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}

export default App;

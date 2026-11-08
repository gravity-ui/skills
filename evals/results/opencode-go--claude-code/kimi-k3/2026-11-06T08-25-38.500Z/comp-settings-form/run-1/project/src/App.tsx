import * as React from 'react';

import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Select,
  Switch,
  Text,
  TextInput,
} from '@gravity-ui/uikit';
import {ArrowUpFromSquare} from '@gravity-ui/icons';

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
  {value: 'America/New_York', content: 'Нью-Йорк (GMT−5)'},
];

const EMAIL_NOTIFICATIONS = [
  {value: 'product_news', label: 'Новости продукта'},
  {value: 'system_alerts', label: 'Системные алерты'},
  {value: 'weekly_digest', label: 'Дайджест за неделю'},
];

const initialState = {
  name: 'Иван Петров',
  email: 'ivan.petrov@example.com',
  avatarUrl: '',
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactor: false,
  notifications: ['product_news'] as string[],
};

export function App() {
  const [form, setForm] = React.useState(initialState);
  const [saved, setSaved] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const patch = (changes: Partial<typeof form>) => {
    setSaved(false);
    setForm((prev) => ({...prev, ...changes}));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => patch({avatarUrl: String(reader.result)});
    reader.readAsDataURL(file);
  };

  const toggleNotification = (value: string, checked: boolean) => {
    const notifications = checked
      ? [...form.notifications, value]
      : form.notifications.filter((item) => item !== value);
    patch({notifications});
  };

  const handleCancel = () => {
    setForm(initialState);
    setSaved(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <div style={{display: 'flex', justifyContent: 'center', padding: '32px 16px'}}>
      <Card style={{width: '100%', maxWidth: 640, padding: 28}}>
        <form onSubmit={handleSubmit}>
          <Text variant="header-1" style={{marginBottom: 24, display: 'block'}}>
            Настройки профиля
          </Text>

          <section style={{marginBottom: 24}}>
            <Text variant="subheader-2" style={{display: 'block', marginBottom: 12}}>
              Основная информация
            </Text>

            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16}}>
              <Avatar
                size="xl"
                text={form.name}
                imgUrl={form.avatarUrl || undefined}
                borderColor="var(--g-color-line-generic)"
              />
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
                <Button
                  view="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Button.Icon>
                    <ArrowUpFromSquare />
                  </Button.Icon>
                  Загрузить аватар
                </Button>
              </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <TextInput
                label="Имя"
                value={form.name}
                onChange={(e) => patch({name: e.target.value})}
                placeholder="Введите имя"
              />
              <TextInput
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => patch({email: e.target.value})}
                placeholder="you@example.com"
              />
            </div>
          </section>

          <section style={{marginBottom: 24}}>
            <Text variant="subheader-2" style={{display: 'block', marginBottom: 12}}>
              Региональные настройки
            </Text>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
              <div>
                <Text variant="body-1" style={{display: 'block', marginBottom: 6}}>
                  Язык интерфейса
                </Text>
                <Select
                  width="max"
                  options={LANGUAGES}
                  value={[form.language]}
                  onUpdate={([value]) => value && patch({language: value})}
                />
              </div>
              <div>
                <Text variant="body-1" style={{display: 'block', marginBottom: 6}}>
                  Часовой пояс
                </Text>
                <Select
                  width="max"
                  options={TIMEZONES}
                  value={[form.timezone]}
                  onUpdate={([value]) => value && patch({timezone: value})}
                />
              </div>
            </div>
          </section>

          <section style={{marginBottom: 24}}>
            <Text variant="subheader-2" style={{display: 'block', marginBottom: 12}}>
              Безопасность
            </Text>
            <Switch
              checked={form.twoFactor}
              onUpdate={(checked) => patch({twoFactor: checked})}
            >
              Двухфакторная авторизация
            </Switch>
          </section>

          <section style={{marginBottom: 28}}>
            <Text variant="subheader-2" style={{display: 'block', marginBottom: 12}}>
              Email-уведомления
            </Text>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
              {EMAIL_NOTIFICATIONS.map((item) => (
                <Checkbox
                  key={item.value}
                  checked={form.notifications.includes(item.value)}
                  onUpdate={(checked) => toggleNotification(item.value, checked)}
                  content={item.label}
                />
              ))}
            </div>
          </section>

          <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <Button view="action" size="l" type="submit">
              Сохранить
            </Button>
            <Button view="flat" size="l" type="button" onClick={handleCancel}>
              Отмена
            </Button>
            {saved ? (
              <Text variant="body-1" color="positive">
                Настройки сохранены
              </Text>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}

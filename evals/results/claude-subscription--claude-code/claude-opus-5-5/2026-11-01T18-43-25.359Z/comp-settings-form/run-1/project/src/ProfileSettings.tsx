import * as React from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Flex,
  Select,
  Switch,
  Text,
  TextInput,
  useFileInput,
} from '@gravity-ui/uikit';
import type { SelectOption } from '@gravity-ui/uikit';

import './ProfileSettings.css';

export type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

export interface ProfileSettingsValues {
  name: string;
  email: string;
  /** URL изображения (http(s) или data URL после загрузки). null — аватар не задан. */
  avatarUrl: string | null;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: Record<NotificationKey, boolean>;
}

export interface ProfileSettingsProps {
  initialValues: ProfileSettingsValues;
  /** Сохранение на сервере. Если промис отклонён — показывается ошибка, данные формы не теряются. */
  onSave: (values: ProfileSettingsValues) => Promise<void>;
}

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'es', content: 'Español' },
  { value: 'kk', content: 'Қазақ тілі' },
  { value: 'uz', content: 'Oʻzbekcha' },
  { value: 'tr', content: 'Türkçe' },
];

const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград' },
  { value: 'Europe/Moscow', content: '(UTC+03:00) Москва, Санкт-Петербург' },
  { value: 'Europe/Samara', content: '(UTC+04:00) Самара' },
  { value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург' },
  { value: 'Asia/Omsk', content: '(UTC+06:00) Омск' },
  { value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск' },
  { value: 'Asia/Krasnoyarsk', content: '(UTC+07:00) Красноярск' },
  { value: 'Asia/Irkutsk', content: '(UTC+08:00) Иркутск' },
  { value: 'Asia/Yakutsk', content: '(UTC+09:00) Якутск' },
  { value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток' },
  { value: 'Asia/Magadan', content: '(UTC+11:00) Магадан' },
  { value: 'Asia/Kamchatka', content: '(UTC+12:00) Петропавловск-Камчатский' },
  { value: 'UTC', content: '(UTC+00:00) Всемирное координированное время' },
  { value: 'Europe/London', content: '(UTC+00:00) Лондон' },
  { value: 'Europe/Berlin', content: '(UTC+01:00) Берлин, Париж, Рим' },
  { value: 'Asia/Almaty', content: '(UTC+05:00) Алматы' },
  { value: 'Asia/Tashkent', content: '(UTC+05:00) Ташкент' },
  { value: 'Asia/Dubai', content: '(UTC+04:00) Дубай' },
  { value: 'America/New_York', content: '(UTC−05:00) Нью-Йорк' },
  { value: 'America/Los_Angeles', content: '(UTC−08:00) Лос-Анджелес' },
];

const NOTIFICATION_OPTIONS: { key: NotificationKey; title: string; description: string }[] = [
  {
    key: 'productNews',
    title: 'Новости продукта',
    description: 'Анонсы новых функций и обновлений',
  },
  {
    key: 'systemAlerts',
    title: 'Системные алерты',
    description: 'Важные события безопасности и состояния аккаунта',
  },
  {
    key: 'weeklyDigest',
    title: 'Дайджест за неделю',
    description: 'Сводка активности по понедельникам',
  },
];

const AVATAR_MAX_SIZE_MB = 5;
const AVATAR_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<'name' | 'email', string>>;

function validate(values: ProfileSettingsValues): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) {
    errors.name = 'Укажите имя';
  }
  const email = values.email.trim();
  if (!email) {
    errors.email = 'Укажите email';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Некорректный email';
  }
  return errors;
}

function isEqual(a: ProfileSettingsValues, b: ProfileSettingsValues) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

type Status = { type: 'success' | 'error'; text: string } | null;

export function ProfileSettings({ initialValues, onSave }: ProfileSettingsProps) {
  const [saved, setSaved] = React.useState(initialValues);
  const [values, setValues] = React.useState(initialValues);
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<Status>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);

  const errors = validate(values);
  const hasErrors = Object.keys(errors).length > 0;
  const dirty = !isEqual(values, saved);

  const update = <K extends keyof ProfileSettingsValues>(key: K, value: ProfileSettingsValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setStatus(null);
  };

  const updateNotification = (key: NotificationKey, checked: boolean) => {
    setValues((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: checked } }));
    setStatus(null);
  };

  const handleAvatarFiles = React.useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Можно загрузить только изображение (PNG, JPEG, WebP, GIF)');
      return;
    }
    if (file.size > AVATAR_MAX_SIZE_MB * 1024 * 1024) {
      setAvatarError(`Файл больше ${AVATAR_MAX_SIZE_MB} МБ`);
      return;
    }

    try {
      const url = await readFileAsDataUrl(file);
      setAvatarError(null);
      setStatus(null);
      setValues((prev) => ({ ...prev, avatarUrl: url }));
    } catch {
      setAvatarError('Не удалось прочитать файл');
    }
  }, []);

  const { controlProps: fileControlProps, triggerProps: fileTriggerProps } = useFileInput({
    onUpdate: handleAvatarFiles,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (hasErrors || saving) return;

    const payload: ProfileSettingsValues = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
    };

    setSaving(true);
    setStatus(null);
    try {
      await onSave(payload);
      setSaved(payload);
      setValues(payload);
      setSubmitAttempted(false);
      setStatus({ type: 'success', text: 'Изменения сохранены' });
    } catch (e) {
      const message = e instanceof Error && e.message ? e.message : 'Попробуйте ещё раз';
      setStatus({ type: 'error', text: `Не удалось сохранить: ${message}` });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValues(saved);
    setSubmitAttempted(false);
    setAvatarError(null);
    setStatus(null);
  };

  const showError = (field: keyof FieldErrors) => (submitAttempted ? errors[field] : undefined);

  return (
    <Card view="outlined" size="l" className="profile-settings">
      <form onSubmit={handleSubmit} noValidate>
        <Flex direction="column" gap={6}>
          <Text variant="header-2" as="h1" className="profile-settings__title">
            Настройки профиля
          </Text>

          {/* Основное */}
          <section className="profile-settings__section">
            <Text variant="subheader-3" as="h2" className="profile-settings__section-title">
              Основное
            </Text>

            <div className="profile-settings__field">
              <span className="profile-settings__label" id="avatar-label">
                Аватар
              </span>
              <Flex gap={4} alignItems="center">
                {values.avatarUrl ? (
                  <Avatar imgUrl={values.avatarUrl} size="xl" alt="Аватар" />
                ) : (
                  <Avatar text={values.name.trim() || '?'} size="xl" theme="brand" />
                )}
                <Flex direction="column" gap={2}>
                  <Flex gap={2}>
                    <input
                      {...fileControlProps}
                      accept={AVATAR_ACCEPT}
                      aria-labelledby="avatar-label"
                    />
                    <Button view="outlined" {...fileTriggerProps} disabled={saving}>
                      {values.avatarUrl ? 'Заменить' : 'Загрузить'}
                    </Button>
                    {values.avatarUrl && (
                      <Button
                        view="flat-danger"
                        onClick={() => update('avatarUrl', null)}
                        disabled={saving}
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
                      PNG, JPEG, WebP или GIF, до {AVATAR_MAX_SIZE_MB} МБ
                    </Text>
                  )}
                </Flex>
              </Flex>
            </div>

            <div className="profile-settings__field">
              <label className="profile-settings__label" htmlFor="profile-name">
                Имя
              </label>
              <TextInput
                id="profile-name"
                size="l"
                value={values.name}
                onUpdate={(v) => update('name', v)}
                placeholder="Как к вам обращаться"
                autoComplete="name"
                disabled={saving}
                validationState={showError('name') ? 'invalid' : undefined}
                errorMessage={showError('name')}
              />
            </div>

            <div className="profile-settings__field">
              <label className="profile-settings__label" htmlFor="profile-email">
                Email
              </label>
              <TextInput
                id="profile-email"
                type="email"
                size="l"
                value={values.email}
                onUpdate={(v) => update('email', v)}
                placeholder="name@example.com"
                autoComplete="email"
                disabled={saving}
                validationState={showError('email') ? 'invalid' : undefined}
                errorMessage={showError('email')}
              />
            </div>
          </section>

          {/* Интерфейс */}
          <section className="profile-settings__section">
            <Text variant="subheader-3" as="h2" className="profile-settings__section-title">
              Интерфейс
            </Text>

            <div className="profile-settings__field">
              <label className="profile-settings__label" htmlFor="profile-language">
                Язык интерфейса
              </label>
              <Select
                id="profile-language"
                size="l"
                width="max"
                options={LANGUAGE_OPTIONS}
                value={[values.language]}
                onUpdate={([v]) => v && update('language', v)}
                disabled={saving}
              />
            </div>

            <div className="profile-settings__field">
              <label className="profile-settings__label" htmlFor="profile-timezone">
                Часовой пояс
              </label>
              <Select
                id="profile-timezone"
                size="l"
                width="max"
                filterable
                filterPlaceholder="Поиск города"
                options={TIMEZONE_OPTIONS}
                value={[values.timezone]}
                onUpdate={([v]) => v && update('timezone', v)}
                disabled={saving}
              />
            </div>
          </section>

          {/* Безопасность */}
          <section className="profile-settings__section">
            <Text variant="subheader-3" as="h2" className="profile-settings__section-title">
              Безопасность
            </Text>

            <Flex justifyContent="space-between" alignItems="center" gap={4}>
              <Flex direction="column" gap={1}>
                <label className="profile-settings__label" htmlFor="profile-2fa">
                  Двухфакторная авторизация
                </label>
                <Text variant="body-1" color="secondary">
                  При входе дополнительно запрашивается код из приложения-аутентификатора
                </Text>
              </Flex>
              <Switch
                id="profile-2fa"
                size="l"
                checked={values.twoFactorEnabled}
                onUpdate={(checked) => update('twoFactorEnabled', checked)}
                disabled={saving}
              />
            </Flex>
          </section>

          {/* Уведомления */}
          <fieldset className="profile-settings__section profile-settings__fieldset" disabled={saving}>
            <legend className="profile-settings__legend">
              <Text variant="subheader-3" as="span">
                Email-уведомления
              </Text>
            </legend>

            <Flex direction="column" gap={3}>
              {NOTIFICATION_OPTIONS.map(({ key, title, description }) => (
                <Checkbox
                  key={key}
                  size="l"
                  checked={values.notifications[key]}
                  onUpdate={(checked) => updateNotification(key, checked)}
                  disabled={saving}
                >
                  <Flex direction="column">
                    <Text variant="body-1">{title}</Text>
                    <Text variant="caption-2" color="secondary">
                      {description}
                    </Text>
                  </Flex>
                </Checkbox>
              ))}
            </Flex>
          </fieldset>

          {status && (
            <Alert
              theme={status.type === 'success' ? 'success' : 'danger'}
              message={status.text}
              onClose={() => setStatus(null)}
            />
          )}

          <Flex gap={2} justifyContent="flex-end" className="profile-settings__actions">
            <Button view="normal" size="l" onClick={handleCancel} disabled={!dirty || saving}>
              Отмена
            </Button>
            <Button view="action" size="l" type="submit" loading={saving} disabled={!dirty}>
              Сохранить
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
}

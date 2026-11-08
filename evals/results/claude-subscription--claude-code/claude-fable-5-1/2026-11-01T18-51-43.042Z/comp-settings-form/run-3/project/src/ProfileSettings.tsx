import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Checkbox,
  Divider,
  Select,
  Switch,
  Text,
  TextInput,
} from '@gravity-ui/uikit';

import './ProfileSettings.css';

export interface ProfileSettingsValues {
  name: string;
  email: string;
  /** Data URL или http(s)-ссылка на картинку. Пустая строка — аватара нет. */
  avatarUrl: string;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  notifications: {
    productNews: boolean;
    systemAlerts: boolean;
    weeklyDigest: boolean;
  };
}

export interface ProfileSettingsProps {
  initialValues?: ProfileSettingsValues;
  /** Вызывается при нажатии «Сохранить» после успешной валидации. Может быть асинхронным. */
  onSave?: (values: ProfileSettingsValues) => void | Promise<void>;
  /** Вызывается при нажатии «Отмена» после сброса формы к исходным значениям. */
  onCancel?: () => void;
}

export const LANGUAGE_OPTIONS = [
  { value: 'ru', content: 'Русский' },
  { value: 'en', content: 'English' },
  { value: 'de', content: 'Deutsch' },
  { value: 'fr', content: 'Français' },
  { value: 'es', content: 'Español' },
  { value: 'tr', content: 'Türkçe' },
  { value: 'kk', content: 'Қазақша' },
  { value: 'uz', content: "O'zbekcha" },
];

export const TIMEZONE_OPTIONS = [
  { value: 'UTC', content: '(UTC+00:00) UTC' },
  { value: 'Europe/London', content: '(UTC+00:00) Лондон' },
  { value: 'Europe/Berlin', content: '(UTC+01:00) Берлин, Париж, Мадрид' },
  { value: 'Europe/Kaliningrad', content: '(UTC+02:00) Калининград' },
  { value: 'Europe/Moscow', content: '(UTC+03:00) Москва, Санкт-Петербург' },
  { value: 'Europe/Istanbul', content: '(UTC+03:00) Стамбул' },
  { value: 'Europe/Samara', content: '(UTC+04:00) Самара' },
  { value: 'Asia/Dubai', content: '(UTC+04:00) Дубай' },
  { value: 'Asia/Yekaterinburg', content: '(UTC+05:00) Екатеринбург' },
  { value: 'Asia/Tashkent', content: '(UTC+05:00) Ташкент' },
  { value: 'Asia/Almaty', content: '(UTC+05:00) Алматы' },
  { value: 'Asia/Omsk', content: '(UTC+06:00) Омск' },
  { value: 'Asia/Novosibirsk', content: '(UTC+07:00) Новосибирск' },
  { value: 'Asia/Krasnoyarsk', content: '(UTC+07:00) Красноярск' },
  { value: 'Asia/Irkutsk', content: '(UTC+08:00) Иркутск' },
  { value: 'Asia/Shanghai', content: '(UTC+08:00) Пекин, Шанхай' },
  { value: 'Asia/Yakutsk', content: '(UTC+09:00) Якутск' },
  { value: 'Asia/Tokyo', content: '(UTC+09:00) Токио' },
  { value: 'Asia/Vladivostok', content: '(UTC+10:00) Владивосток' },
  { value: 'Asia/Magadan', content: '(UTC+11:00) Магадан' },
  { value: 'Asia/Kamchatka', content: '(UTC+12:00) Петропавловск-Камчатский' },
  { value: 'America/New_York', content: '(UTC-05:00) Нью-Йорк' },
  { value: 'America/Chicago', content: '(UTC-06:00) Чикаго' },
  { value: 'America/Denver', content: '(UTC-07:00) Денвер' },
  { value: 'America/Los_Angeles', content: '(UTC-08:00) Лос-Анджелес' },
];

const DEFAULT_VALUES: ProfileSettingsValues = {
  name: '',
  email: '',
  avatarUrl: '',
  language: 'ru',
  timezone: 'Europe/Moscow',
  twoFactorEnabled: false,
  notifications: {
    productNews: true,
    systemAlerts: true,
    weeklyDigest: false,
  },
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<'name' | 'email', string>>;

function validate(values: ProfileSettingsValues): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();

  if (!name) {
    errors.name = 'Укажите имя';
  } else if (name.length > 100) {
    errors.name = 'Имя не должно быть длиннее 100 символов';
  }

  if (!email) {
    errors.email = 'Укажите email';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Некорректный email';
  }

  return errors;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}

function isEqual(a: ProfileSettingsValues, b: ProfileSettingsValues): boolean {
  return (
    a.name === b.name &&
    a.email === b.email &&
    a.avatarUrl === b.avatarUrl &&
    a.language === b.language &&
    a.timezone === b.timezone &&
    a.twoFactorEnabled === b.twoFactorEnabled &&
    a.notifications.productNews === b.notifications.productNews &&
    a.notifications.systemAlerts === b.notifications.systemAlerts &&
    a.notifications.weeklyDigest === b.notifications.weeklyDigest
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

interface RowProps {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

function Row({ label, hint, htmlFor, children }: RowProps) {
  return (
    <div className="profile-settings__row">
      <div className="profile-settings__row-label">
        <Text as="label" variant="body-2" {...(htmlFor ? { htmlFor } : {})}>
          {label}
        </Text>
        {hint ? (
          <Text as="span" variant="caption-2" color="secondary" className="profile-settings__row-hint">
            {hint}
          </Text>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function ProfileSettings({
  initialValues = DEFAULT_VALUES,
  onSave,
  onCancel,
}: ProfileSettingsProps) {
  const [values, setValues] = useState<ProfileSettingsValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ theme: 'success' | 'danger'; message: string } | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Если родитель передал новые исходные значения (например, после загрузки профиля) — подхватываем их.
  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    setAvatarError(null);
    setStatus(null);
  }, [initialValues]);

  const dirty = !isEqual(values, initialValues);

  const update = <K extends keyof ProfileSettingsValues>(key: K, value: ProfileSettingsValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setStatus(null);
  };

  const updateNotification = (key: keyof ProfileSettingsValues['notifications'], checked: boolean) => {
    setValues((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: checked } }));
    setStatus(null);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Сбрасываем input, чтобы повторный выбор того же файла снова вызвал onChange.
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError('Поддерживаются только изображения PNG, JPEG, WebP или GIF');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('Размер файла не должен превышать 2 МБ');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarError(null);
      update('avatarUrl', dataUrl);
    } catch {
      setAvatarError('Не удалось загрузить изображение');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus({ theme: 'danger', message: 'Исправьте ошибки в форме и попробуйте снова' });
      return;
    }

    const payload: ProfileSettingsValues = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
    };

    setSaving(true);
    try {
      await onSave?.(payload);
      setValues(payload);
      setStatus({ theme: 'success', message: 'Настройки сохранены' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось сохранить настройки';
      setStatus({ theme: 'danger', message });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValues(initialValues);
    setErrors({});
    setAvatarError(null);
    setStatus(null);
    onCancel?.();
  };

  return (
    <form className="profile-settings" onSubmit={handleSubmit} noValidate>
      <Text as="h1" variant="header-2" style={{ margin: '0 0 24px' }}>
        Настройки профиля
      </Text>

      <div className="profile-settings__section">
        <Text as="h2" variant="subheader-3" style={{ margin: 0 }}>
          Основное
        </Text>

        <Row label="Имя" htmlFor="profile-name">
          <TextInput
            id="profile-name"
            name="name"
            size="l"
            value={values.name}
            onUpdate={(v) => {
              update('name', v);
              if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
            }}
            placeholder="Иван Иванов"
            autoComplete="name"
            validationState={errors.name ? 'invalid' : undefined}
            errorMessage={errors.name}
            hasClear
          />
        </Row>

        <Row label="Email" htmlFor="profile-email">
          <TextInput
            id="profile-email"
            name="email"
            type="email"
            size="l"
            value={values.email}
            onUpdate={(v) => {
              update('email', v);
              if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
            }}
            placeholder="name@example.com"
            autoComplete="email"
            validationState={errors.email ? 'invalid' : undefined}
            errorMessage={errors.email}
            hasClear
          />
        </Row>

        <Row label="Аватар" hint="PNG, JPEG, WebP или GIF, до 2 МБ">
          <div className="profile-settings__avatar">
            {values.avatarUrl ? (
              <Avatar size="xl" imgUrl={values.avatarUrl} alt="Аватар пользователя" />
            ) : (
              <Avatar size="xl" theme="brand" text={getInitials(values.name)} />
            )}
            <div>
              <div className="profile-settings__avatar-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_AVATAR_TYPES.join(',')}
                  onChange={handleAvatarChange}
                  hidden
                  aria-label="Загрузить аватар"
                />
                <Button view="outlined" size="m" onClick={() => fileInputRef.current?.click()}>
                  {values.avatarUrl ? 'Заменить' : 'Загрузить'}
                </Button>
                {values.avatarUrl ? (
                  <Button
                    view="flat-danger"
                    size="m"
                    onClick={() => {
                      setAvatarError(null);
                      update('avatarUrl', '');
                    }}
                  >
                    Удалить
                  </Button>
                ) : null}
              </div>
              {avatarError ? (
                <Text as="div" variant="caption-2" color="danger" style={{ marginTop: 6 }}>
                  {avatarError}
                </Text>
              ) : null}
            </div>
          </div>
        </Row>
      </div>

      <Divider style={{ margin: '24px 0' }} />

      <div className="profile-settings__section">
        <Text as="h2" variant="subheader-3" style={{ margin: 0 }}>
          Локализация
        </Text>

        <Row label="Язык интерфейса">
          <Select
            size="l"
            width="max"
            value={[values.language]}
            options={LANGUAGE_OPTIONS}
            onUpdate={([v]) => v && update('language', v)}
            placeholder="Выберите язык"
            aria-label="Язык интерфейса"
          />
        </Row>

        <Row label="Часовой пояс">
          <Select
            size="l"
            width="max"
            filterable
            filterPlaceholder="Поиск по названию"
            value={[values.timezone]}
            options={TIMEZONE_OPTIONS}
            onUpdate={([v]) => v && update('timezone', v)}
            placeholder="Выберите часовой пояс"
            aria-label="Часовой пояс"
          />
        </Row>
      </div>

      <Divider style={{ margin: '24px 0' }} />

      <div className="profile-settings__section">
        <Text as="h2" variant="subheader-3" style={{ margin: 0 }}>
          Безопасность
        </Text>

        <Row
          label="Двухфакторная авторизация"
          hint="При входе дополнительно потребуется код из приложения-аутентификатора"
        >
          <Switch
            size="l"
            checked={values.twoFactorEnabled}
            onUpdate={(checked) => update('twoFactorEnabled', checked)}
            content={values.twoFactorEnabled ? 'Включена' : 'Выключена'}
          />
        </Row>
      </div>

      <Divider style={{ margin: '24px 0' }} />

      <div className="profile-settings__section">
        <Text as="h2" variant="subheader-3" style={{ margin: 0 }}>
          Уведомления
        </Text>

        <Row label="Email-уведомления" hint="Какие письма вы хотите получать">
          <div className="profile-settings__checkbox-group" role="group" aria-label="Email-уведомления">
            <Checkbox
              size="l"
              checked={values.notifications.productNews}
              onUpdate={(c) => updateNotification('productNews', c)}
              content="Новости продукта"
            />
            <Checkbox
              size="l"
              checked={values.notifications.systemAlerts}
              onUpdate={(c) => updateNotification('systemAlerts', c)}
              content="Системные алерты"
            />
            <Checkbox
              size="l"
              checked={values.notifications.weeklyDigest}
              onUpdate={(c) => updateNotification('weeklyDigest', c)}
              content="Дайджест за неделю"
            />
          </div>
        </Row>
      </div>

      <Divider style={{ margin: '24px 0' }} />

      {status ? (
        <Alert
          theme={status.theme}
          message={status.message}
          onClose={() => setStatus(null)}
          style={{ marginBottom: 16 }}
        />
      ) : null}

      <div className="profile-settings__footer">
        <Button type="submit" view="action" size="l" loading={saving} disabled={!dirty && !saving}>
          Сохранить
        </Button>
        <Button type="button" view="flat" size="l" onClick={handleCancel} disabled={saving}>
          Отмена
        </Button>
        {dirty && !saving ? (
          <Text variant="caption-2" color="secondary">
            Есть несохранённые изменения
          </Text>
        ) : null}
      </div>
    </form>
  );
}

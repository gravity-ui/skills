import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  Flex,
  Select,
  Switch,
  Text,
  TextInput,
  useToaster,
} from '@gravity-ui/uikit';

import { AvatarUploader } from './AvatarUploader';
import { FormRow } from './FormRow';
import { LANGUAGE_OPTIONS, NOTIFICATION_OPTIONS, buildTimeZoneOptions } from './options';
import type { NotificationKey, ProfileFieldErrors, ProfileSettings } from './types';
import { validateProfile } from './validation';
import './ProfileSettingsPage.css';

interface ProfileSettingsPageProps {
  initialValues: ProfileSettings;
  /**
   * Сохранение на сервере. Получает значения формы и новый файл аватара
   * (null — аватар не менялся или был удалён, см. `avatarUrl`).
   */
  onSave: (values: ProfileSettings, avatarFile: File | null) => Promise<ProfileSettings>;
  onCancel?: () => void;
}

function isSameSettings(a: ProfileSettings, b: ProfileSettings): boolean {
  return (
    a.name === b.name &&
    a.email === b.email &&
    a.avatarUrl === b.avatarUrl &&
    a.language === b.language &&
    a.timeZone === b.timeZone &&
    a.twoFactorEnabled === b.twoFactorEnabled &&
    NOTIFICATION_OPTIONS.every(({ key }) => a.notifications[key] === b.notifications[key])
  );
}

export function ProfileSettingsPage({ initialValues, onSave, onCancel }: ProfileSettingsPageProps) {
  const toaster = useToaster();

  // «Сохранённое» состояние — к нему откатывает «Отмена».
  const [saved, setSaved] = useState<ProfileSettings>(initialValues);
  const [values, setValues] = useState<ProfileSettings>(initialValues);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean }>({});
  const [saving, setSaving] = useState(false);

  // blob: URL превью для выбранного, но ещё не сохранённого файла.
  const previewUrlRef = useRef<string | null>(null);
  const revokePreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };
  useEffect(() => revokePreview, []);

  const timeZoneOptions = useMemo(() => buildTimeZoneOptions(), []);

  const isDirty = !isSameSettings(values, saved);

  const update = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const updateNotification = (key: NotificationKey, checked: boolean) => {
    setValues((prev) => ({ ...prev, notifications: { ...prev.notifications, [key]: checked } }));
  };

  // Валидируем «на лету» только поля, которых пользователь уже касался
  // или по которым была попытка сохранить.
  const revalidate = (next: Pick<ProfileSettings, 'name' | 'email'>) => {
    const all = validateProfile(next);
    setErrors({
      name: touched.name ? all.name : undefined,
      email: touched.email ? all.email : undefined,
    });
  };

  const handleBlur = (field: 'name' | 'email') => {
    const nextTouched = { ...touched, [field]: true };
    setTouched(nextTouched);
    const all = validateProfile(values);
    setErrors({
      name: nextTouched.name ? all.name : undefined,
      email: nextTouched.email ? all.email : undefined,
    });
  };

  const handleAvatarSelect = (file: File) => {
    revokePreview();
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setAvatarFile(file);
    update('avatarUrl', url);
  };

  const handleAvatarRemove = () => {
    revokePreview();
    setAvatarFile(null);
    update('avatarUrl', null);
  };

  const handleCancel = () => {
    revokePreview();
    setAvatarFile(null);
    setValues(saved);
    setErrors({});
    setTouched({});
    onCancel?.();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    const validationErrors = validateProfile(values);
    setTouched({ name: true, email: true });
    setErrors(validationErrors);
    if (validationErrors.name || validationErrors.email) {
      return;
    }

    const payload: ProfileSettings = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim(),
    };

    setSaving(true);
    try {
      const result = await onSave(payload, avatarFile);
      if (result.avatarUrl === previewUrlRef.current) {
        // Бэкенд (или заглушка) оставил blob: URL как итоговый — он теперь
        // «сохранённое» значение, отзывать его при «Отмене» нельзя.
        previewUrlRef.current = null;
      } else {
        // Сервер вернул постоянный URL аватара — blob: больше не нужен.
        revokePreview();
      }
      setSaved(result);
      setValues(result);
      setAvatarFile(null);
      setTouched({});
      setErrors({});
      toaster.add({
        name: 'profile-saved',
        title: 'Настройки сохранены',
        theme: 'success',
        autoHiding: 4000,
      });
    } catch (error) {
      toaster.add({
        name: 'profile-save-failed',
        title: 'Не удалось сохранить',
        content: error instanceof Error ? error.message : 'Попробуйте ещё раз.',
        theme: 'danger',
        autoHiding: false,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit} noValidate>
      <header className="profile-form__header">
        <Text variant="header-2" as="h1">
          Настройки профиля
        </Text>
        <Text variant="body-1" color="secondary" as="p">
          Личные данные, язык, безопасность и уведомления.
        </Text>
      </header>

      <section className="profile-form__section" aria-labelledby="profile-section-personal">
        <Text variant="subheader-2" as="h2" id="profile-section-personal">
          Личные данные
        </Text>

        <FormRow label="Аватар" hint="Отображается в шапке и комментариях">
          <AvatarUploader
            imageUrl={values.avatarUrl}
            name={values.name}
            disabled={saving}
            onFileSelect={handleAvatarSelect}
            onRemove={handleAvatarRemove}
          />
        </FormRow>

        <FormRow label="Имя" htmlFor="profile-name">
          <TextInput
            id="profile-name"
            name="name"
            size="l"
            value={values.name}
            placeholder="Как к вам обращаться"
            autoComplete="name"
            disabled={saving}
            validationState={errors.name ? 'invalid' : undefined}
            errorMessage={errors.name}
            errorPlacement="outside"
            onUpdate={(value) => {
              update('name', value);
              revalidate({ name: value, email: values.email });
            }}
            onBlur={() => handleBlur('name')}
          />
        </FormRow>

        <FormRow label="Email" htmlFor="profile-email" hint="Используется для входа и уведомлений">
          <TextInput
            id="profile-email"
            name="email"
            type="email"
            size="l"
            value={values.email}
            placeholder="name@example.com"
            autoComplete="email"
            disabled={saving}
            validationState={errors.email ? 'invalid' : undefined}
            errorMessage={errors.email}
            errorPlacement="outside"
            onUpdate={(value) => {
              update('email', value);
              revalidate({ name: values.name, email: value });
            }}
            onBlur={() => handleBlur('email')}
          />
        </FormRow>
      </section>

      <Divider />

      <section className="profile-form__section" aria-labelledby="profile-section-locale">
        <Text variant="subheader-2" as="h2" id="profile-section-locale">
          Язык и регион
        </Text>

        <FormRow label="Язык интерфейса" htmlFor="profile-language">
          <Select
            id="profile-language"
            name="language"
            size="l"
            width="max"
            value={[values.language]}
            options={LANGUAGE_OPTIONS}
            disabled={saving}
            onUpdate={([value]) => value && update('language', value)}
          />
        </FormRow>

        <FormRow label="Часовой пояс" htmlFor="profile-timezone" hint="Влияет на отображение дат и времени">
          <Select
            id="profile-timezone"
            name="timeZone"
            size="l"
            width="max"
            filterable
            filterPlaceholder="Поиск по городу"
            value={[values.timeZone]}
            options={timeZoneOptions}
            disabled={saving}
            popupWidth="fit"
            onUpdate={([value]) => value && update('timeZone', value)}
          />
        </FormRow>
      </section>

      <Divider />

      <section className="profile-form__section" aria-labelledby="profile-section-security">
        <Text variant="subheader-2" as="h2" id="profile-section-security">
          Безопасность
        </Text>

        <FormRow label="Двухфакторная авторизация" hint="Код из приложения-аутентификатора при каждом входе">
          <Switch
            size="l"
            name="twoFactorEnabled"
            checked={values.twoFactorEnabled}
            disabled={saving}
            onUpdate={(checked) => update('twoFactorEnabled', checked)}
            content={values.twoFactorEnabled ? 'Включена' : 'Выключена'}
          />
        </FormRow>
      </section>

      <Divider />

      <section className="profile-form__section" aria-labelledby="profile-section-notifications">
        <Text variant="subheader-2" as="h2" id="profile-section-notifications">
          Email-уведомления
        </Text>

        <FormRow label="Присылать на почту">
          <Flex direction="column" gap="3" role="group" aria-label="Типы email-уведомлений">
            {NOTIFICATION_OPTIONS.map(({ key, title, description }) => (
              <Checkbox
                key={key}
                size="l"
                name={`notifications.${key}`}
                checked={values.notifications[key]}
                disabled={saving}
                onUpdate={(checked) => updateNotification(key, checked)}
              >
                <span className="profile-form__checkbox-content">
                  <Text variant="body-2">{title}</Text>
                  <Text variant="caption-2" color="secondary">
                    {description}
                  </Text>
                </span>
              </Checkbox>
            ))}
          </Flex>
        </FormRow>
      </section>

      <footer className="profile-form__footer">
        <Flex gap="3" alignItems="center" wrap>
          <Button type="submit" view="action" size="l" loading={saving} disabled={!isDirty}>
            Сохранить
          </Button>
          <Button type="button" view="flat" size="l" onClick={handleCancel} disabled={saving || !isDirty}>
            Отмена
          </Button>
          {isDirty && !saving ? (
            <Text variant="body-1" color="secondary">
              Есть несохранённые изменения
            </Text>
          ) : null}
        </Flex>
      </footer>
    </form>
  );
}

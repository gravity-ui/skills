import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Flex,
  Select,
  Switch,
  Text,
  TextInput,
  useFileInput,
} from '@gravity-ui/uikit';

import {
  LANGUAGE_OPTIONS,
  type NotificationSettings,
  type ProfileData,
  type ProfileSaveRequest,
  getTimezoneOptions,
  isSameProfile,
  validateAvatarFile,
  validateProfile,
} from './profile';

export interface ProfileSettingsPageProps {
  /** Currently saved profile. */
  profile: ProfileData;
  /** Persists the profile. Resolves with the saved data; rejects on failure. */
  onSave: (request: ProfileSaveRequest) => Promise<ProfileData>;
}

const TIMEZONE_OPTIONS = getTimezoneOptions();

/** Object URL for a local file, revoked on change/unmount (StrictMode-safe). */
function useObjectUrl(file: File | null): string | null {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}

export function ProfileSettingsPage({profile, onSave}: ProfileSettingsPageProps) {
  // `saved` is the baseline that Cancel and the dirty check compare against.
  const [saved, setSaved] = React.useState<ProfileData>(profile);
  const [draft, setDraft] = React.useState<ProfileData>(profile);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [savedNotice, setSavedNotice] = React.useState(false);

  const avatarPreviewUrl = useObjectUrl(avatarFile);
  const errors = validateProfile(draft);
  const hasErrors = Object.keys(errors).length > 0;
  const isDirty = avatarFile !== null || !isSameProfile(draft, saved);

  const update = (patch: Partial<ProfileData>) => {
    setDraft((current) => ({...current, ...patch}));
    setSavedNotice(false);
    setSaveError(null);
  };

  const updateNotification = (key: keyof NotificationSettings, value: boolean) => {
    update({notifications: {...draft.notifications, [key]: value}});
  };

  const {controlProps: avatarInputProps, triggerProps: avatarTriggerProps} = useFileInput({
    onUpdate: ([file]) => {
      if (!file) {
        return;
      }
      const error = validateAvatarFile(file);
      setAvatarError(error);
      if (!error) {
        setAvatarFile(file);
        setSavedNotice(false);
      }
    },
  });

  const handleSave = async () => {
    setSubmitAttempted(true);
    if (hasErrors || !isDirty) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const result = await onSave({profile: draft, avatarFile});
      setSaved(result);
      setDraft(result);
      setAvatarFile(null);
      setSubmitAttempted(false);
      setSavedNotice(true);
    } catch {
      setSaveError('Не удалось сохранить изменения. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(saved);
    setAvatarFile(null);
    setAvatarError(null);
    setSubmitAttempted(false);
    setSaveError(null);
    setSavedNotice(false);
  };

  const nameError = submitAttempted ? errors.name : undefined;
  const emailError = submitAttempted ? errors.email : undefined;
  const avatarSrc = avatarPreviewUrl ?? draft.avatarUrl;

  return (
    <Box maxWidth={640} spacing={{p: 6}}>
      <Flex direction="column" gap={6}>
        <Text as="h1" variant="header-1">
          Настройки профиля
        </Text>

        <Flex direction="column" gap={3}>
          <Text variant="subheader-1">Аватар</Text>
          <Flex alignItems="center" gap={4} wrap>
            {avatarSrc ? (
              <Avatar size="xl" imgUrl={avatarSrc} alt={draft.name} style={{flexShrink: 0}} />
            ) : (
              <Avatar size="xl" text={draft.name || '?'} style={{flexShrink: 0}} />
            )}
            <Flex direction="column" gap={1}>
              <Button view="outlined" {...avatarTriggerProps}>
                Загрузить аватар
              </Button>
              <Text variant="caption-1" color="secondary">
                Изображение до 5 МБ
              </Text>
              {avatarError && (
                <Text variant="caption-1" color="danger">
                  {avatarError}
                </Text>
              )}
            </Flex>
          </Flex>
          <input {...avatarInputProps} accept="image/*" />
        </Flex>

        <Flex direction="column" gap={4}>
          <Text variant="subheader-1">Основное</Text>
          <TextInput
            label="Имя"
            value={draft.name}
            onUpdate={(name) => update({name})}
            errorMessage={nameError}
            validationState={nameError ? 'invalid' : undefined}
          />
          <TextInput
            type="email"
            label="Email"
            value={draft.email}
            onUpdate={(email) => update({email})}
            errorMessage={emailError}
            validationState={emailError ? 'invalid' : undefined}
          />
          <Select
            label="Язык интерфейса"
            width="max"
            options={LANGUAGE_OPTIONS}
            value={[draft.language]}
            onUpdate={([language]) => {
              if (language) {
                update({language});
              }
            }}
          />
          <Select
            label="Часовой пояс"
            width="max"
            filterable
            options={TIMEZONE_OPTIONS}
            value={[draft.timezone]}
            onUpdate={([timezone]) => {
              if (timezone) {
                update({timezone});
              }
            }}
          />
        </Flex>

        <Flex direction="column" gap={1}>
          <Switch
            checked={draft.twoFactorEnabled}
            onUpdate={(twoFactorEnabled) => update({twoFactorEnabled})}
            content="Двухфакторная аутентификация"
          />
          <Text variant="caption-1" color="secondary">
            При каждом входе потребуется код из приложения-аутентификатора
          </Text>
        </Flex>

        <Flex direction="column" gap={3}>
          <Text variant="subheader-1">Email-уведомления</Text>
          <Checkbox
            checked={draft.notifications.productNews}
            onUpdate={(value) => updateNotification('productNews', value)}
            content="Новости продукта"
          />
          <Checkbox
            checked={draft.notifications.systemAlerts}
            onUpdate={(value) => updateNotification('systemAlerts', value)}
            content="Системные алерты"
          />
          <Checkbox
            checked={draft.notifications.weeklyDigest}
            onUpdate={(value) => updateNotification('weeklyDigest', value)}
            content="Дайджест за неделю"
          />
        </Flex>

        <Flex direction="column" gap={2}>
          {saveError && (
            <Text variant="body-1" color="danger">
              {saveError}
            </Text>
          )}
          {savedNotice && (
            <Text variant="body-1" color="positive">
              Изменения сохранены
            </Text>
          )}
          <Flex justifyContent="flex-end" gap={2} wrap>
            <Button view="outlined" size="l" onClick={handleCancel} disabled={saving}>
              Отмена
            </Button>
            <Button
              view="action"
              size="l"
              onClick={handleSave}
              disabled={!isDirty}
              loading={saving}
            >
              Сохранить
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}

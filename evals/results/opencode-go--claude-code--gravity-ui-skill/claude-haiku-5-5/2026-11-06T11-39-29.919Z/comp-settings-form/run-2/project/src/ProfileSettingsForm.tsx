import * as React from 'react';
import {
  Avatar,
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
  INITIAL_PROFILE,
  LANGUAGE_OPTIONS,
  NOTIFICATION_OPTIONS,
  TIMEZONE_OPTIONS,
  validateAvatarFile,
  validateProfile,
} from './profileSettings';
import type {ProfileSettings} from './profileSettings';

interface FieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
}

function Field({id, label, children}: FieldProps) {
  return (
    <Flex direction="column" gap={2}>
      <Text as="label" htmlFor={id} variant="subheader-1">
        {label}
      </Text>
      {children}
    </Flex>
  );
}

export function ProfileSettingsForm() {
  // Последнее сохранённое состояние — к нему откатывается «Отмена».
  const [saved, setSaved] = React.useState<ProfileSettings>(INITIAL_PROFILE);
  const [values, setValues] = React.useState<ProfileSettings>(INITIAL_PROFILE);
  const [submitted, setSubmitted] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState<string | null>(null);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);

  // Object URL создаём в эффекте, чтобы cleanup освобождал его и в StrictMode.
  React.useEffect(() => {
    if (!values.avatar) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(values.avatar);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [values.avatar]);

  const errors = validateProfile(values);

  const update = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
    setValues((prev) => ({...prev, [key]: value}));
    setSaveMessage(null);
  };

  const updateNotification = (key: keyof ProfileSettings['notifications'], checked: boolean) => {
    setValues((prev) => ({
      ...prev,
      notifications: {...prev.notifications, [key]: checked},
    }));
    setSaveMessage(null);
  };

  const handleAvatarFiles = (files: File[]) => {
    const file = files[0];
    if (!file) {
      return;
    }
    const error = validateAvatarFile(file);
    setAvatarError(error);
    if (!error) {
      update('avatar', file);
    }
  };

  const {controlProps, triggerProps} = useFileInput({onUpdate: handleAvatarFiles});

  const handleSave = () => {
    setSubmitted(true);
    if (Object.keys(validateProfile(values)).length > 0) {
      setSaveMessage(null);
      return;
    }
    setSaved(values);
    setSaveMessage('Изменения сохранены');
  };

  const handleCancel = () => {
    setValues(saved);
    setSubmitted(false);
    setAvatarError(null);
    setSaveMessage(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSave();
  };

  const showNameError = submitted && errors.name;
  const showEmailError = submitted && errors.email;

  return (
    <form onSubmit={handleSubmit} noValidate style={{maxWidth: 560}}>
      <Flex direction="column" gap={6}>
        <Flex direction="column" gap={2}>
          <Text variant="subheader-1">Аватар</Text>
          <Flex alignItems="center" gap={4}>
            <Avatar
              size="xl"
              {...(avatarPreview
                ? {imgUrl: avatarPreview, alt: 'Аватар пользователя'}
                : {text: values.name || '?'})}
            />
            <Flex direction="column" gap={1}>
              <input {...controlProps} accept="image/*" />
              <Flex>
                <Button {...triggerProps} type="button" view="outlined" size="m">
                  Загрузить
                </Button>
              </Flex>
              <Text variant="caption-1" color="secondary">
                PNG, JPG или WebP до 2 МБ
              </Text>
              {avatarError && (
                <Text variant="caption-1" color="danger">
                  {avatarError}
                </Text>
              )}
            </Flex>
          </Flex>
        </Flex>

        <Field id="profile-name" label="Имя">
          <TextInput
            id="profile-name"
            name="name"
            size="l"
            autoComplete="name"
            value={values.name}
            onUpdate={(value) => update('name', value)}
            validationState={showNameError ? 'invalid' : undefined}
            errorMessage={showNameError ? errors.name : undefined}
          />
        </Field>

        <Field id="profile-email" label="Email">
          <TextInput
            id="profile-email"
            name="email"
            type="email"
            size="l"
            autoComplete="email"
            value={values.email}
            onUpdate={(value) => update('email', value)}
            validationState={showEmailError ? 'invalid' : undefined}
            errorMessage={showEmailError ? errors.email : undefined}
          />
        </Field>

        <Field id="profile-language" label="Язык интерфейса">
          <Select
            id="profile-language"
            name="language"
            size="l"
            width="max"
            options={LANGUAGE_OPTIONS}
            value={[values.language]}
            onUpdate={([language]) => update('language', language)}
          />
        </Field>

        <Field id="profile-timezone" label="Часовой пояс">
          <Select
            id="profile-timezone"
            name="timezone"
            size="l"
            width="max"
            options={TIMEZONE_OPTIONS}
            value={[values.timezone]}
            onUpdate={([timezone]) => update('timezone', timezone)}
          />
        </Field>

        <Flex direction="column" gap={2}>
          <Text variant="subheader-1">Безопасность</Text>
          <Switch
            size="l"
            checked={values.twoFactorEnabled}
            onUpdate={(checked) => update('twoFactorEnabled', checked)}
          >
            Двухфакторная аутентификация
          </Switch>
        </Flex>

        <fieldset style={{border: 0, margin: 0, padding: 0, minWidth: 0}}>
          <Flex direction="column" gap={3}>
            <Text as="legend" variant="subheader-1">
              Email-уведомления
            </Text>
            {NOTIFICATION_OPTIONS.map(({key, label}) => (
              <Checkbox
                key={key}
                size="l"
                checked={values.notifications[key]}
                onUpdate={(checked) => updateNotification(key, checked)}
              >
                {label}
              </Checkbox>
            ))}
          </Flex>
        </fieldset>

        <Flex justifyContent="flex-end" alignItems="center" gap={3} wrap>
          {saveMessage && (
            <Text variant="body-1" color="positive" style={{marginRight: 'auto'}}>
              {saveMessage}
            </Text>
          )}
          <Button type="button" view="outlined" size="l" onClick={handleCancel}>
            Отмена
          </Button>
          <Button type="submit" view="action" size="l">
            Сохранить
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}

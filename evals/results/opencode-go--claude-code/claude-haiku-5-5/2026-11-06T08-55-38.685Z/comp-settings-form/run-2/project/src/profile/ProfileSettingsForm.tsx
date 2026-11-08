import { useState, type FormEvent, type ReactNode } from 'react';
import { Alert, Button, Checkbox, Flex, Select, Switch, Text, TextInput } from '@gravity-ui/uikit';
import { AvatarUploader } from './AvatarUploader';
import {
  EMAIL_NOTIFICATION_OPTIONS,
  LANGUAGE_OPTIONS,
  TIMEZONE_OPTIONS,
  validateProfile,
  type EmailNotification,
  type ProfileSettings,
} from './model';

export interface ProfileSettingsFormProps {
  initialValues: ProfileSettings;
  /** Persists the profile. Resolve on success, reject on failure. */
  onSave: (values: ProfileSettings) => Promise<void>;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <Text as="label" htmlFor={htmlFor} variant="subheader-1" style={{ display: 'block' }}>
      {children}
    </Text>
  );
}

export function ProfileSettingsForm({ initialValues, onSave }: ProfileSettingsFormProps) {
  // `saved` is the last persisted state (baseline for dirty-checking and Cancel);
  // `draft` is what the user is currently editing.
  const [saved, setSaved] = useState(initialValues);
  const [draft, setDraft] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const issues = validateProfile(draft);
  const hasIssues = Object.keys(issues).length > 0;
  // Only show field errors after the first submit attempt.
  const errors = submitted ? issues : {};

  const update = <K extends keyof ProfileSettings>(key: K, value: ProfileSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setJustSaved(false);
    setSaveError(null);
  };

  const toggleNotification = (value: EmailNotification, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      // Keep canonical option order regardless of click order.
      emailNotifications: EMAIL_NOTIFICATION_OPTIONS.map((o) => o.value).filter((v) =>
        v === value ? checked : prev.emailNotifications.includes(v),
      ),
    }));
    setJustSaved(false);
  };

  const handleCancel = () => {
    setDraft(saved);
    setSubmitted(false);
    setSaveError(null);
    setJustSaved(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isDirty || hasIssues || saving) return;

    const normalized: ProfileSettings = {
      ...draft,
      name: draft.name.trim(),
      email: draft.email.trim(),
    };

    setSaving(true);
    setSaveError(null);
    setJustSaved(false);
    try {
      await onSave(normalized);
      setSaved(normalized);
      setDraft(normalized);
      setSubmitted(false);
      setJustSaved(true);
    } catch {
      setSaveError('Не удалось сохранить изменения. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Flex direction="column" gap={6}>
        <Text as="h1" variant="header-2">
          Настройки профиля
        </Text>

        <Flex direction="column" gap={2}>
          <Text variant="subheader-1">Аватар</Text>
          <AvatarUploader
            src={draft.avatarUrl}
            name={draft.name}
            onChange={(dataUrl) => update('avatarUrl', dataUrl)}
          />
        </Flex>

        <Flex direction="column" gap={2}>
          <FieldLabel htmlFor="profile-name">Имя</FieldLabel>
          <TextInput
            id="profile-name"
            size="l"
            value={draft.name}
            onUpdate={(v) => update('name', v)}
            validationState={errors.name ? 'invalid' : undefined}
            errorMessage={errors.name}
            autoComplete="name"
          />
        </Flex>

        <Flex direction="column" gap={2}>
          <FieldLabel htmlFor="profile-email">Email</FieldLabel>
          <TextInput
            id="profile-email"
            size="l"
            type="email"
            value={draft.email}
            onUpdate={(v) => update('email', v)}
            validationState={errors.email ? 'invalid' : undefined}
            errorMessage={errors.email}
            autoComplete="email"
          />
        </Flex>

        <Flex direction="column" gap={2}>
          <FieldLabel htmlFor="profile-language">Язык интерфейса</FieldLabel>
          <Select
            id="profile-language"
            size="l"
            width="max"
            options={LANGUAGE_OPTIONS}
            value={[draft.language]}
            onUpdate={(v) => v[0] && update('language', v[0])}
            popupWidth="fit"
          />
        </Flex>

        <Flex direction="column" gap={2}>
          <FieldLabel htmlFor="profile-timezone">Часовой пояс</FieldLabel>
          <Select
            id="profile-timezone"
            size="l"
            width="max"
            filterable
            options={TIMEZONE_OPTIONS}
            value={[draft.timezone]}
            onUpdate={(v) => v[0] && update('timezone', v[0])}
            popupWidth="fit"
          />
        </Flex>

        <Flex direction="column" gap={2}>
          <Text variant="subheader-1">Безопасность</Text>
          <Switch
            size="l"
            checked={draft.twoFactorEnabled}
            onUpdate={(checked) => update('twoFactorEnabled', checked)}
          >
            <Text variant="body-2">Двухфакторная аутентификация</Text>
          </Switch>
          <Text variant="caption-1" color="secondary">
            При входе дополнительно запрашивать код из приложения-аутентификатора
          </Text>
        </Flex>

        <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
          <Flex direction="column" gap={2}>
            <Text as="legend" variant="subheader-1" style={{ padding: 0, marginBottom: 8 }}>
              Email-уведомления
            </Text>
            {EMAIL_NOTIFICATION_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                size="l"
                checked={draft.emailNotifications.includes(option.value)}
                onUpdate={(checked) => toggleNotification(option.value, checked)}
                content={option.label}
              />
            ))}
          </Flex>
        </fieldset>

        {saveError && (
          <Alert theme="danger" message={saveError} />
        )}

        <Flex
          justifyContent="space-between"
          alignItems="center"
          gap={4}
          wrap="wrap"
          style={{ borderTop: '1px solid var(--g-color-line-generic)', paddingTop: 16 }}
        >
          <Text variant="body-1" color={justSaved ? 'positive' : 'secondary'} role="status">
            {justSaved ? 'Изменения сохранены' : isDirty ? 'Есть несохранённые изменения' : ''}
          </Text>

          <Flex gap={2}>
            <Button
              view="outlined"
              size="l"
              onClick={handleCancel}
              disabled={!isDirty || saving}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              view="action"
              size="l"
              loading={saving}
              disabled={!isDirty || saving}
            >
              Сохранить
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}

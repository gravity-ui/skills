export type NotificationKey = 'productNews' | 'systemAlerts' | 'weeklyDigest';

export type NotificationSettings = Record<NotificationKey, boolean>;

export interface ProfileSettings {
  name: string;
  email: string;
  /** Текущий URL аватара (серверный или blob: для ещё не сохранённого файла). */
  avatarUrl: string | null;
  language: string;
  timeZone: string;
  twoFactorEnabled: boolean;
  notifications: NotificationSettings;
}

export type ProfileFieldErrors = Partial<Record<'name' | 'email', string>>;

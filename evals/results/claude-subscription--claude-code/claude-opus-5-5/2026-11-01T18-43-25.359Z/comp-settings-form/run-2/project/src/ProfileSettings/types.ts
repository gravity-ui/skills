export interface EmailNotifications {
  productNews: boolean;
  systemAlerts: boolean;
  weeklyDigest: boolean;
}

export interface ProfileSettingsValues {
  name: string;
  email: string;
  /** URL of the current avatar (null — no avatar). */
  avatarUrl: string | null;
  language: string;
  timeZone: string;
  twoFactorEnabled: boolean;
  notifications: EmailNotifications;
}

export interface ProfileSettingsSubmit extends ProfileSettingsValues {
  /** Newly selected avatar file, if the user picked one. */
  avatarFile: File | null;
}

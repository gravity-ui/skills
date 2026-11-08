export type ProfileSettings = {
    name: string;
    email: string;
    avatarFileName: string | null;
    avatarPreviewUrl: string | null;
    language: string;
    timezone: string;
    twoFactorEnabled: boolean;
    notifications: {
        productNews: boolean;
        systemAlerts: boolean;
        weeklyDigest: boolean;
    };
};

export type ProfileSettingsErrors = {
    name?: string;
    email?: string;
    avatar?: string;
};

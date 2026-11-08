import {configure} from '@gravity-ui/uikit';

import {ProfileSettings, type ProfileFormValues} from './ProfileSettings/ProfileSettings';

// Built-in component strings (Select "nothing found", FormRow "required" hint, …) in Russian.
configure({lang: 'ru'});

const INITIAL_VALUES: ProfileFormValues = {
    name: 'Анна Смирнова',
    email: 'anna.smirnova@example.com',
    avatarUrl: null,
    language: 'ru',
    timezone: 'Europe/Moscow',
    twoFactorEnabled: false,
    notifications: {
        productNews: true,
        systemAlerts: true,
        weeklyDigest: false,
    },
};

// Stand-in for the real API call.
const saveProfile = (values: ProfileFormValues, avatarFile: File | null) =>
    new Promise<void>((resolve) => {
        console.info('Saving profile', values, avatarFile);
        setTimeout(resolve, 800);
    });

export function App() {
    return (
        <ProfileSettings initialValues={INITIAL_VALUES} onSave={saveProfile} />
    );
}

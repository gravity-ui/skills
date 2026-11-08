import {Lang, Toaster, ToasterComponent, ToasterProvider, configure} from '@gravity-ui/uikit';

import {ProfileSettingsPage} from './profile/ProfileSettingsPage';

// The page is in Russian — switch built-in uikit/components strings too.
configure({lang: Lang.Ru});

const toaster = new Toaster();

export function App() {
    return (
        <ToasterProvider toaster={toaster}>
            <ProfileSettingsPage />
            <ToasterComponent />
        </ToasterProvider>
    );
}

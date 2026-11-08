import {PageConstructor, PageConstructorProvider, Theme} from '@gravity-ui/page-constructor';
import {useThemeType} from '@gravity-ui/uikit';

import {content} from './content';

export function App() {
    const themeType = useThemeType();

    return (
        <PageConstructorProvider theme={themeType === 'dark' ? Theme.Dark : Theme.Light}>
            <PageConstructor content={content} />
        </PageConstructorProvider>
    );
}

import {configure as configureUikit} from '@gravity-ui/uikit';
import {configure as configureMarkdownEditor} from '@gravity-ui/markdown-editor';

// Интерфейс формы на русском: переключаем язык и uikit, и редактора.
configureUikit({lang: 'ru'});
configureMarkdownEditor({lang: 'ru'});

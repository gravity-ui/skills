import {Card, Link, Text} from '@gravity-ui/uikit';

import {toHref} from '../router';
import type {AppTheme} from '../theme';

interface HomePageProps {
    theme: AppTheme;
    notesCount: number;
}

export function HomePage({theme, notesCount}: HomePageProps) {
    return (
        <section className="page">
            <Text as="h1" variant="display-1">
                Добро пожаловать
            </Text>
            <Text as="p" color="secondary">
                Небольшое приложение из трёх страниц. Переключайтесь между ними в шапке, а тему
                меняйте кнопкой справа — выбор сохранится между перезагрузками.
            </Text>

            <div className="cards">
                <Card view="outlined" className="cards__item">
                    <Text as="h2" variant="subheader-2">
                        Заметки
                    </Text>
                    <Text as="p" color="secondary">
                        Сейчас заметок: {notesCount}. Они сохраняются при переходе между страницами.
                    </Text>
                    <Link href={toHref('/notes')}>Открыть заметки</Link>
                </Card>
                <Card view="outlined" className="cards__item">
                    <Text as="h2" variant="subheader-2">
                        Тема
                    </Text>
                    <Text as="p" color="secondary">
                        Активна {theme === 'dark' ? 'тёмная' : 'светлая'} тема.
                    </Text>
                    <Link href={toHref('/about')}>О приложении</Link>
                </Card>
            </div>
        </section>
    );
}

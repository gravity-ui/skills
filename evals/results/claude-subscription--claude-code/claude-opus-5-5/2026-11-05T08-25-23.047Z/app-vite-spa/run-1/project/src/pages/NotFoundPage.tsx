import {Link, Text} from '@gravity-ui/uikit';

import {toHref} from '../router';

export function NotFoundPage() {
    return (
        <section className="page">
            <Text as="h1" variant="display-1">
                Страница не найдена
            </Text>
            <Link href={toHref('/')}>Вернуться на главную</Link>
        </section>
    );
}

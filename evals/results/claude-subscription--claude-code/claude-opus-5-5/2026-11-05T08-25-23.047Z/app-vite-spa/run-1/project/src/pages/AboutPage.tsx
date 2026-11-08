import {DefinitionList, Text} from '@gravity-ui/uikit';

export function AboutPage() {
    return (
        <section className="page">
            <Text as="h1" variant="display-1">
                О приложении
            </Text>
            <Text as="p" color="secondary">
                Демонстрация навигации между страницами и переключения светлой/тёмной темы.
            </Text>

            <DefinitionList nameMaxWidth={180}>
                <DefinitionList.Item name="Интерфейс">React 18 + Gravity UI</DefinitionList.Item>
                <DefinitionList.Item name="Сборка">Vite</DefinitionList.Item>
                <DefinitionList.Item name="Навигация">
                    Hash-роутинг (#/путь), работает без настройки сервера
                </DefinitionList.Item>
                <DefinitionList.Item name="Тема">
                    ThemeProvider; выбор хранится в localStorage, по умолчанию — системная
                </DefinitionList.Item>
            </DefinitionList>
        </section>
    );
}

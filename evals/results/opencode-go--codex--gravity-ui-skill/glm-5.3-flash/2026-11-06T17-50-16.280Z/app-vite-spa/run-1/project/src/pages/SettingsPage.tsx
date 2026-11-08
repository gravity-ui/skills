import {Card, Flex, SegmentedRadioGroup, Switch, Text} from '@gravity-ui/uikit';
import {useAppTheme} from '../theme';

export function SettingsPage() {
    const {theme, setTheme} = useAppTheme();

    return (
        <>
            <Flex className="page-header" direction="column" gap="1">
                <Text variant="header-2">Настройки</Text>
                <Text variant="body-1" color="secondary">
                    Управляйте внешним видом приложения.
                </Text>
            </Flex>
            <div className="settings-layout">
                <Card type="container" view="filled" size="l">
                    <div className="settings-card-content">
                        <Text variant="subheader-3">Тема интерфейса</Text>
                        <SegmentedRadioGroup
                            value={theme}
                            onUpdate={(value) => setTheme(value as typeof theme)}
                            aria-label="Тема интерфейса"
                        >
                            <SegmentedRadioGroup.Option value="light" content="Светлая" />
                            <SegmentedRadioGroup.Option value="dark" content="Тёмная" />
                        </SegmentedRadioGroup>
                        <Text variant="body-2" color="secondary">
                            Выбор сохраняется между перезагрузками страницы.
                        </Text>
                    </div>
                </Card>
                <Card type="container" view="outlined" size="l">
                    <div className="settings-card-content">
                        <Text variant="subheader-3">Уведомления</Text>
                        <div className="settings-item">
                            <Text variant="body-2" color="primary">
                                Обновления проектов
                            </Text>
                            <Switch defaultChecked />
                        </div>
                        <div className="settings-item">
                            <Text variant="body-2" color="primary">
                                Еженедельный отчет
                            </Text>
                            <Switch />
                        </div>
                        <div className="status-note">
                            <Text variant="body-2">Настройки в этом примере локальные.</Text>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    );
}

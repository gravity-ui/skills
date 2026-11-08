import {Card, Link, Text} from '@gravity-ui/uikit';

const FEATURES = [
    {title: 'React + TypeScript', text: 'Приложение собрано на Vite с React 18 и TypeScript.'},
    {title: 'Gravity UI', text: 'Компоненты и темизация из @gravity-ui/uikit.'},
    {title: 'Тёмная тема', text: 'Тема переключается в шапке и сохраняется между визитами.'},
];

export function AboutPage() {
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
            <Text variant="header-1">О проекте</Text>
            <Text variant="body-2" color="secondary">
                Демонстрационное приложение на{' '}
                <Link href="https://gravity-ui.com" target="_blank">
                    Gravity UI
                </Link>
                .
            </Text>
            <div style={{display: 'flex', gap: 16, flexWrap: 'wrap'}}>
                {FEATURES.map((f) => (
                    <Card
                        key={f.title}
                        style={{padding: 20, flex: '1 1 220px', minWidth: 220}}
                    >
                        <Text variant="subheader-2">{f.title}</Text>
                        <div style={{marginTop: 8}}>
                            <Text variant="body-1" color="secondary">
                                {f.text}
                            </Text>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

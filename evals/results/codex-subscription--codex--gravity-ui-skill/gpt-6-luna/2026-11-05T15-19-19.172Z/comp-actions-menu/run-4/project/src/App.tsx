import {useState} from 'react';
import {Button, DropdownMenu, type DropdownMenuItem} from '@gravity-ui/uikit';
import './App.css';

const actions = [
    {id: 'edit', text: 'Редактировать', description: 'Изменить название и детали'},
    {id: 'copy', text: 'Создать копию', description: 'Сохранить отдельный экземпляр'},
    {id: 'share', text: 'Поделиться', description: 'Настроить доступ для команды'},
    {id: 'archive', text: 'Переместить в архив', description: 'Скрыть из активных проектов'},
];

export function App() {
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const menuItems: DropdownMenuItem[] = actions.map(({id, text}) => ({
        text,
        action: () => setLastAction(id),
    }));

    const selectedAction = actions.find(({id}) => id === lastAction);

    return (
        <main className="page">
            <section className="action-card" aria-labelledby="page-title">
                <div className="card-topline">
                    <span className="eyebrow">РАБОЧЕЕ ПРОСТРАНСТВО</span>
                    <span className="status"><span className="status-dot" />Активный проект</span>
                </div>

                <div className="card-content">
                    <div className="project-mark" aria-hidden="true">N</div>
                    <div className="project-info">
                        <h1 id="page-title">Новый проект</h1>
                        <p>Здесь собраны быстрые действия для проекта</p>
                    </div>
                    <DropdownMenu
                        items={menuItems}
                        open={menuOpen}
                        onOpenToggle={setMenuOpen}
                        renderSwitcher={({onClick, onKeyDown}) => (
                            <Button
                                view="outlined"
                                size="l"
                                className="actions-trigger"
                                onClick={onClick}
                                onKeyDown={onKeyDown}
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                            >
                                Действия
                                <span className="trigger-chevron" aria-hidden="true" />
                            </Button>
                        )}
                    />
                </div>

                <div className="card-footer" aria-live="polite">
                    {selectedAction ? (
                        <>
                            <span className="footer-label">ВЫПОЛНЕНО</span>
                            <span className="action-result">{selectedAction.text}</span>
                        </>
                    ) : (
                        <>
                            <span className="footer-label">БЫСТРЫЕ ДЕЙСТВИЯ</span>
                            <span className="footer-hint">Нажмите кнопку, чтобы открыть меню</span>
                        </>
                    )}
                </div>
            </section>

            <p className="page-caption">Управляйте проектом в пару кликов</p>
        </main>
    );
}

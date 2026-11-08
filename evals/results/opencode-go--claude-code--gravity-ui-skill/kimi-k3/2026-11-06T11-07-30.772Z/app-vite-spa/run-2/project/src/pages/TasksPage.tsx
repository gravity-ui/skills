import React from 'react';
import {Box, Button, Card, Checkbox, Flex, Icon, Label, Text, TextInput} from '@gravity-ui/uikit';
import {Plus, TrashBin} from '@gravity-ui/icons';

interface Task {
    id: number;
    title: string;
    done: boolean;
}

const initialTasks: Task[] = [
    {id: 1, title: 'Изучить компоненты Gravity UI', done: true},
    {id: 2, title: 'Собрать навигацию между страницами', done: true},
    {id: 3, title: 'Добавить переключатель темы', done: false},
];

export function TasksPage() {
    const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
    const [draft, setDraft] = React.useState('');

    const remaining = tasks.filter((task) => !task.done).length;

    const addTask = () => {
        const title = draft.trim();
        if (!title) {
            return;
        }
        setTasks((prev) => [...prev, {id: Date.now(), title, done: false}]);
        setDraft('');
    };

    const toggleTask = (id: number, done: boolean) => {
        setTasks((prev) => prev.map((task) => (task.id === id ? {...task, done} : task)));
    };

    const removeTask = (id: number) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    };

    return (
        <Flex direction="column" gap={5}>
            <Flex alignItems="center" gap={3}>
                <Text variant="header-1" style={{flex: 1, minWidth: 0}}>
                    Задачи
                </Text>
                <div style={{flexShrink: 0}}>
                    <Label theme="info" size="m">
                        Осталось: {remaining}
                    </Label>
                </div>
            </Flex>

            <Card view="outlined" size="l">
                <Box spacing={{p: 4}}>
                    <Flex gap={3} wrap="wrap">
                        <div style={{flex: '1 1 240px', minWidth: 0}}>
                            <TextInput
                                value={draft}
                                onUpdate={setDraft}
                                placeholder="Новая задача…"
                                size="l"
                                hasClear
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        addTask();
                                    }
                                }}
                            />
                        </div>
                        <Button view="action" size="l" onClick={addTask} style={{flexShrink: 0}}>
                            <Icon data={Plus} size={16} />
                            Добавить
                        </Button>
                    </Flex>
                </Box>
            </Card>

            <Flex direction="column" gap={3}>
                {tasks.map((task) => (
                    <Card key={task.id} view="filled" size="l">
                        <Box spacing={{py: 3, px: 4}}>
                            <Flex alignItems="center" gap={3}>
                                <div style={{flex: 1, minWidth: 0}}>
                                    <Checkbox
                                        size="l"
                                        checked={task.done}
                                        onUpdate={(done) => toggleTask(task.id, done)}
                                        content={
                                            <span
                                                style={{
                                                    textDecoration: task.done
                                                        ? 'line-through'
                                                        : undefined,
                                                    color: task.done
                                                        ? 'var(--g-color-text-hint)'
                                                        : 'var(--g-color-text-primary)',
                                                }}
                                            >
                                                {task.title}
                                            </span>
                                        }
                                    />
                                </div>
                                <Button
                                    view="flat-secondary"
                                    size="m"
                                    onClick={() => removeTask(task.id)}
                                    style={{flexShrink: 0}}
                                >
                                    <Icon data={TrashBin} size={16} />
                                </Button>
                            </Flex>
                        </Box>
                    </Card>
                ))}
                {tasks.length === 0 && (
                    <Text variant="body-2" color="hint">
                        Все задачи выполнены — добавьте новую выше.
                    </Text>
                )}
            </Flex>
        </Flex>
    );
}

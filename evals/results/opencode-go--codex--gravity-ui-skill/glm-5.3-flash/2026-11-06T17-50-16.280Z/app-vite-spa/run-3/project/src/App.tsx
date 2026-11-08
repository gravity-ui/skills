import { useState } from "react";
import {
  Button,
  Card,
  Flex,
  SegmentedRadioGroup,
  Switch,
  Tab,
  TabList,
  TabProvider,
  Text,
  TextInput,
  ThemeProvider,
} from "@gravity-ui/uikit";

import { getInitialTheme, saveTheme, type Theme } from "./theme";
import type { Page, Task } from "./types";

const navigationItems = [
  { id: "dashboard", title: "Обзор" },
  { id: "tasks", title: "Задачи" },
  { id: "settings", title: "Настройки" },
] as const;

const initialTasks: Task[] = [
  { id: 1, title: "Подготовить презентацию продукта", status: "todo" },
  { id: 2, title: "Согласовать макеты с дизайнером", status: "todo" },
  { id: 3, title: "Обновить документацию API", status: "done" },
];

export function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [page, setPage] = useState<Page>("dashboard");

  const changeTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    saveTheme(nextTheme);
  };

  return (
    <ThemeProvider theme={theme}>
      <Flex minHeight="100vh" direction="column">
        <Flex as="header" alignItems="center" justifyContent="space-between" wrap spacing={{ p: 5 }}>
          <Text as="div" variant="header-2">
            Ежедневник
          </Text>
          <ThemeSelector value={theme} onChange={changeTheme} />
        </Flex>

        <Flex as="main" direction="column" gap="5" spacing={{ p: 5, pt: 0 }}>
          <TabProvider value={page} onUpdate={(nextPage) => setPage(nextPage as Page)}>
            <TabList>
              {navigationItems.map(({ id, title }) => (
                <Tab key={id} value={id}>
                  {title}
                </Tab>
              ))}
            </TabList>
          </TabProvider>

          {page === "dashboard" && <DashboardPage onOpenTasks={() => setPage("tasks")} />}
          {page === "tasks" && <TasksPage />}
          {page === "settings" && (
            <SettingsPage theme={theme} onChangeTheme={changeTheme} />
          )}
        </Flex>
      </Flex>
    </ThemeProvider>
  );
}

function ThemeSelector({
  value,
  onChange,
}: {
  value: Theme;
  onChange: (theme: Theme) => void;
}) {
  return (
    <SegmentedRadioGroup<Theme>
      value={value}
      onUpdate={onChange}
      aria-label="Тема оформления"
    >
      <SegmentedRadioGroup.Option value="light" content="Светлая" />
      <SegmentedRadioGroup.Option value="dark" content="Тёмная" />
    </SegmentedRadioGroup>
  );
}

function DashboardPage({ onOpenTasks }: { onOpenTasks: () => void }) {
  return (
    <Flex direction="column" gap="5">
      <Card spacing={{ p: 5 }}>
        <Flex direction="column" gap="3">
          <Text variant="subheader-3">Коротко о работе</Text>
          <Text color="secondary">
            Небольшое приложение на трёх страницах: обзор, задачи и настройки.
          </Text>
          <Flex gap="3" wrap>
            <Button view="action" onClick={onOpenTasks}>
              Открыть задачи
            </Button>
            <Button
              view="outlined"
              onClick={() => window.alert("Синхронизация завершена")}
            >
              Синхронизировать
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Flex gap="5" wrap>
        {[
          { label: "Активные задачи", value: 2 },
          { label: "Завершено за неделю", value: 8 },
          { label: "Встречи сегодня", value: 3 },
        ].map((metric) => (
          <Card key={metric.label} spacing={{ p: 5 }}>
            <Flex direction="column" gap="2">
              <Text color="secondary">{metric.label}</Text>
              <Text variant="header-2">{metric.value}</Text>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}

function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState("");

  const addTask = () => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      return;
    }

    setTasks((currentTasks) => [
      ...currentTasks,
      { id: Date.now(), title: normalizedTitle, status: "todo" },
    ]);
    setTitle("");
  };

  const toggleTask = (taskId: number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "done" ? "todo" : "done" }
          : task,
      ),
    );
  };

  return (
    <Flex direction="column" gap="5">
      <Card spacing={{ p: 5 }}>
        <Flex direction="column" gap="4">
          <Text variant="subheader-3">Новая задача</Text>
          <Flex gap="3" wrap>
            <Flex grow>
              <TextInput
                value={title}
                onUpdate={setTitle}
                placeholder="Что нужно сделать?"
                size="l"
              />
            </Flex>
            <Button view="action" size="l" onClick={addTask}>
              Добавить
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Flex direction="column" gap="3">
        {tasks.map((task) => (
          <Card key={task.id} spacing={{ p: 4 }}>
            <Flex gap="4" alignItems="center" justifyContent="space-between" wrap>
              <Text>{task.title}</Text>
              <Switch
                checked={task.status === "done"}
                onUpdate={(checked) => toggleTask(task.id)}
              />
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}

function SettingsPage({
  theme,
  onChangeTheme,
}: {
  theme: Theme;
  onChangeTheme: (theme: Theme) => void;
}) {
  return (
    <Flex direction="column" gap="5">
      <Card spacing={{ p: 5 }}>
        <Flex direction="column" gap="3">
          <Text variant="subheader-3">Оформление</Text>
          <Text color="secondary">
            Выбор сохраняется в браузере и применяется ко всему приложению.
          </Text>
          <ThemeSelector value={theme} onChange={onChangeTheme} />
        </Flex>
      </Card>

      <Card spacing={{ p: 5 }}>
        <Flex direction="column" gap="3">
          <Text variant="subheader-3">Рабочее время</Text>
          <Flex gap="3" wrap>
            <Flex grow>
              <TextInput defaultValue="09:30" label="Начало" size="l" />
            </Flex>
            <Flex grow>
              <TextInput defaultValue="18:00" label="Конец" size="l" />
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}

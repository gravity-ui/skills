export type Language = 'en' | 'ru';

export const LANGUAGES: Array<{value: Language; label: string}> = [
    {value: 'en', label: 'English'},
    {value: 'ru', label: 'Русский'},
];

export interface Translation {
    languageLabel: string;
    title: string;
    subtitle: string;
    statProjects: string;
    statTasks: string;
    statMembers: string;
    action: string;
    updated: string;
}

export const translations: Record<Language, Translation> = {
    en: {
        languageLabel: 'Interface language',
        title: 'Project dashboard',
        subtitle: 'An overview of your workspace, current tasks and the team.',
        statProjects: 'Projects',
        statTasks: 'Active tasks',
        statMembers: 'Team members',
        action: 'Create project',
        updated: 'Updated just now',
    },
    ru: {
        languageLabel: 'Язык интерфейса',
        title: 'Панель проекта',
        subtitle: 'Обзор рабочего пространства, текущих задач и команды.',
        statProjects: 'Проекты',
        statTasks: 'Активные задачи',
        statMembers: 'Участники команды',
        action: 'Создать проект',
        updated: 'Обновлено только что',
    },
};

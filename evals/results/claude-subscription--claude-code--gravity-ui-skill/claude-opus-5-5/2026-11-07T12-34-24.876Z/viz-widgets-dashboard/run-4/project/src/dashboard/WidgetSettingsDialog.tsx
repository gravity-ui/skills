import type {ConfigItem} from '@gravity-ui/dashkit';
import {Dialog, Flex, Text, TextArea, TextInput} from '@gravity-ui/uikit';
import * as React from 'react';

import {WIDGET_TYPE} from './types';

type Props = {
    item: ConfigItem | null;
    onClose: () => void;
    onApply: (item: ConfigItem) => void;
};

type FormState = {
    title: string;
    text: string;
    value: string;
    delta: string;
};

function toForm(item: ConfigItem): FormState {
    const data = item.data as Record<string, unknown>;
    return {
        title: String(item.type === WIDGET_TYPE.Title ? (data.text ?? '') : (data.title ?? '')),
        text: String(data.text ?? ''),
        value: String(data.value ?? ''),
        delta: String(data.delta ?? ''),
    };
}

function parseNumber(raw: string): number | null {
    const normalized = raw.replace(/\s/g, '').replace(',', '.').replace(/[−–]/g, '-');
    if (normalized === '') return null;
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
}

export function WidgetSettingsDialog({item, onClose, onApply}: Props) {
    const [form, setForm] = React.useState<FormState | null>(null);

    React.useEffect(() => {
        // При закрытии форму не сбрасываем, чтобы содержимое не «мигало» во время анимации.
        if (item) setForm(toForm(item));
    }, [item]);

    const update = (key: keyof FormState) => (value: string) =>
        setForm((prev) => (prev ? {...prev, [key]: value} : prev));

    const isMetric = item?.type === WIDGET_TYPE.Metric;
    const isNote = item?.type === WIDGET_TYPE.Note;

    const titleInvalid = form !== null && form.title.trim() === '';
    const valueInvalid = isMetric && form !== null && parseNumber(form.value) === null;
    const deltaInvalid = isMetric && form !== null && parseNumber(form.delta) === null;
    const hasErrors = titleInvalid || valueInvalid || deltaInvalid;

    const handleApply = () => {
        if (!item || !form || hasErrors) return;

        const data = {...item.data};
        if (item.type === WIDGET_TYPE.Title) {
            data.text = form.title.trim();
        } else {
            data.title = form.title.trim();
        }
        if (isNote) data.text = form.text;
        if (isMetric) {
            data.value = parseNumber(form.value);
            data.delta = parseNumber(form.delta);
        }
        onApply({...item, data});
    };

    return (
        <Dialog open={item !== null} onClose={onClose} size="s">
            <Dialog.Header caption="Настройки виджета" />
            <Dialog.Body>
                {form && (
                    <Flex direction="column" gap={3}>
                        <Flex direction="column" gap={1}>
                            <Text color="secondary">
                                {item?.type === WIDGET_TYPE.Title ? 'Текст заголовка' : 'Название'}
                            </Text>
                            <TextInput
                                value={form.title}
                                onUpdate={update('title')}
                                autoFocus
                                validationState={titleInvalid ? 'invalid' : undefined}
                                errorMessage="Название не может быть пустым"
                            />
                        </Flex>
                        {isMetric && (
                            <>
                                <Flex direction="column" gap={1}>
                                    <Text color="secondary">Значение</Text>
                                    <TextInput
                                        value={form.value}
                                        onUpdate={update('value')}
                                        validationState={valueInvalid ? 'invalid' : undefined}
                                        errorMessage="Введите число"
                                    />
                                </Flex>
                                <Flex direction="column" gap={1}>
                                    <Text color="secondary">Изменение к прошлому периоду, %</Text>
                                    <TextInput
                                        value={form.delta}
                                        onUpdate={update('delta')}
                                        validationState={deltaInvalid ? 'invalid' : undefined}
                                        errorMessage="Введите число, например −2,5"
                                    />
                                </Flex>
                            </>
                        )}
                        {isNote && (
                            <Flex direction="column" gap={1}>
                                <Text color="secondary">Текст</Text>
                                <TextArea value={form.text} onUpdate={update('text')} minRows={4} />
                            </Flex>
                        )}
                    </Flex>
                )}
            </Dialog.Body>
            <Dialog.Footer
                textButtonApply="Сохранить"
                textButtonCancel="Отмена"
                onClickButtonApply={handleApply}
                onClickButtonCancel={onClose}
                propsButtonApply={{disabled: hasErrors}}
            />
        </Dialog>
    );
}

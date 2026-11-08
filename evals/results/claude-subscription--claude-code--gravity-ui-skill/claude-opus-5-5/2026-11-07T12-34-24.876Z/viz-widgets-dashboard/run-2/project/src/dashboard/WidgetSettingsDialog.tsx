import type {ConfigItem} from '@gravity-ui/dashkit';
import {Dialog, Flex, Text, TextArea, TextInput} from '@gravity-ui/uikit';
import {useState} from 'react';

import {WidgetType} from './types';

type FieldKind = 'text' | 'number' | 'textarea';
interface Field {
    key: string;
    label: string;
    kind: FieldKind;
}

const TITLE_FIELD: Field = {key: 'title', label: 'Заголовок', kind: 'text'};

const FIELDS: Record<string, Field[]> = {
    [WidgetType.Title]: [{key: 'text', label: 'Текст заголовка', kind: 'text'}],
    [WidgetType.Metric]: [
        TITLE_FIELD,
        {key: 'value', label: 'Значение', kind: 'text'},
        {key: 'delta', label: 'Изменение, %', kind: 'number'},
    ],
    [WidgetType.Goals]: [TITLE_FIELD],
    [WidgetType.Events]: [TITLE_FIELD],
    [WidgetType.Note]: [TITLE_FIELD, {key: 'text', label: 'Текст', kind: 'textarea'}],
};

interface Props {
    item: ConfigItem;
    onApply: (data: ConfigItem['data']) => void;
    onClose: () => void;
}

/** Mount with `key={item.id}` so the draft resets for every edited widget. */
export function WidgetSettingsDialog({item, onApply, onClose}: Props) {
    const fields = FIELDS[item.type] ?? [];
    const [draft, setDraft] = useState<Record<string, string>>(() =>
        Object.fromEntries(fields.map((f) => [f.key, String(item.data[f.key] ?? '')])),
    );

    const deltaInvalid = fields.some(
        (f) => f.kind === 'number' && draft[f.key].trim() !== '' && !Number.isFinite(Number(draft[f.key].replace(',', '.'))),
    );

    const apply = () => {
        if (deltaInvalid) return;
        const next: ConfigItem['data'] = {...item.data};
        for (const f of fields) {
            next[f.key] = f.kind === 'number' ? Number(draft[f.key].replace(',', '.')) || 0 : draft[f.key];
        }
        onApply(next);
    };

    return (
        <Dialog
            open
            onClose={onClose}
            // Enter must insert a newline in a textarea, not submit the dialog.
            onEnterKeyDown={fields.some((f) => f.kind === 'textarea') ? undefined : apply}
            size="s"
        >
            <Dialog.Header caption="Настройки виджета" />
            <Dialog.Body>
                <Flex direction="column" gap={4}>
                    {fields.map((f) => (
                        <Flex key={f.key} direction="column" gap={1}>
                            <Text variant="subheader-1">{f.label}</Text>
                            {f.kind === 'textarea' ? (
                                <TextArea
                                    value={draft[f.key]}
                                    onUpdate={(v) => setDraft((d) => ({...d, [f.key]: v}))}
                                    minRows={3}
                                    maxRows={8}
                                />
                            ) : (
                                <TextInput
                                    value={draft[f.key]}
                                    onUpdate={(v) => setDraft((d) => ({...d, [f.key]: v}))}
                                    validationState={f.kind === 'number' && deltaInvalid ? 'invalid' : undefined}
                                    errorMessage="Введите число"
                                />
                            )}
                        </Flex>
                    ))}
                </Flex>
            </Dialog.Body>
            <Dialog.Footer
                textButtonApply="Сохранить"
                textButtonCancel="Отмена"
                onClickButtonApply={apply}
                onClickButtonCancel={onClose}
                propsButtonApply={{disabled: deltaInvalid}}
            />
        </Dialog>
    );
}

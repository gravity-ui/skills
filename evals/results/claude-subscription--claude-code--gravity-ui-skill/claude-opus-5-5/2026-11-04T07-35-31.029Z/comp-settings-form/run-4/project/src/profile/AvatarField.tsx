import * as React from 'react';
import {ArrowUpFromLine, TrashBin} from '@gravity-ui/icons';
import {Avatar, Button, Flex, Icon, Text, useFileInput} from '@gravity-ui/uikit';

export type AvatarValue = {url: string; file?: File} | null;

const MAX_SIZE_MB = 5;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

type AvatarFieldProps = {
    id?: string;
    value: AvatarValue;
    /** Used for the initials fallback when there is no image. */
    name: string;
    disabled?: boolean;
    onChange: (file: File | null) => void;
};

export function AvatarField({id, value, name, disabled, onChange}: AvatarFieldProps) {
    const [error, setError] = React.useState<string | null>(null);

    const handleFiles = React.useCallback(
        (files: File[]) => {
            const file = files[0];
            if (!file) {
                return;
            }
            if (!ACCEPTED_TYPES.includes(file.type)) {
                setError('Поддерживаются форматы PNG, JPEG, WEBP и GIF');
                return;
            }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                setError(`Файл больше ${MAX_SIZE_MB} МБ`);
                return;
            }
            setError(null);
            onChange(file);
        },
        [onChange],
    );

    const {controlProps, triggerProps} = useFileInput({
        onUpdate: handleFiles,
        // Reset the native input so choosing the same file again fires `change`.
        onChange: (event) => {
            event.target.value = '';
        },
    });

    const handleRemove = () => {
        setError(null);
        onChange(null);
    };

    const initials = name.trim() || '?';

    return (
        <Flex direction="column" gap={2}>
            <Flex alignItems="center" gap={4} wrap>
                <div style={{flexShrink: 0}}>
                    {value ? (
                        <Avatar size="xl" imgUrl={value.url} alt="Аватар" />
                    ) : (
                        <Avatar size="xl" text={initials} theme="brand" />
                    )}
                </div>
                <Flex direction="column" gap={2} style={{minWidth: 0}}>
                    <Flex gap={2} wrap>
                        <input
                            {...controlProps}
                            id={id}
                            accept={ACCEPTED_TYPES.join(',')}
                            disabled={disabled}
                        />
                        <Button view="outlined" disabled={disabled} {...triggerProps}>
                            <Icon data={ArrowUpFromLine} size={16} />
                            {value ? 'Заменить фото' : 'Загрузить фото'}
                        </Button>
                        {value && (
                            <Button view="flat-danger" disabled={disabled} onClick={handleRemove}>
                                <Icon data={TrashBin} size={16} />
                                Удалить
                            </Button>
                        )}
                    </Flex>
                    <Text variant="caption-2" color="secondary">
                        PNG, JPEG, WEBP или GIF, не больше {MAX_SIZE_MB} МБ
                    </Text>
                </Flex>
            </Flex>
            {error && (
                <Text variant="body-1" color="danger" role="alert">
                    {error}
                </Text>
            )}
        </Flex>
    );
}

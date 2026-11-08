import { useId, useRef, useState } from 'react';
import { Avatar, Button, Flex, Icon, Text } from '@gravity-ui/uikit';
import { ArrowUpFromLine, TrashBin } from '@gravity-ui/icons';

import { AVATAR_ACCEPTED_TYPES, getInitials, validateAvatarFile } from './validation';

interface AvatarUploaderProps {
  imageUrl: string | null;
  /** Имя пользователя — для инициалов и alt-текста */
  name: string;
  disabled?: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

export function AvatarUploader({ imageUrl, name, disabled, onFileSelect, onRemove }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();

  const openPicker = () => inputRef.current?.click();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Сбрасываем value, иначе повторный выбор того же файла не вызовет change.
    event.target.value = '';
    if (!file) return;

    const validationError = validateAvatarFile(file);
    setError(validationError);
    if (!validationError) {
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setError(null);
    onRemove();
  };

  return (
    <Flex gap="4" alignItems="center" wrap>
      {imageUrl ? (
        <Avatar size="xl" imgUrl={imageUrl} alt={`Аватар пользователя ${name}`.trim()} />
      ) : (
        <Avatar size="xl" theme="brand" text={getInitials(name)} aria-label="Аватар не загружен" />
      )}

      <Flex direction="column" gap="2">
        <Flex gap="2" wrap>
          <Button view="outlined" size="m" onClick={openPicker} disabled={disabled}>
            <Icon data={ArrowUpFromLine} size={16} />
            {imageUrl ? 'Заменить фото' : 'Загрузить фото'}
          </Button>
          {imageUrl ? (
            <Button view="flat-danger" size="m" onClick={handleRemove} disabled={disabled}>
              <Icon data={TrashBin} size={16} />
              Удалить
            </Button>
          ) : null}
        </Flex>
        <Text
          variant="caption-2"
          color={error ? 'danger' : 'secondary'}
          id={errorId}
          role={error ? 'alert' : undefined}
        >
          {error ?? 'JPG, PNG или WebP до 2 МБ.'}
        </Text>
      </Flex>

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPTED_TYPES.join(',')}
        onChange={handleChange}
        disabled={disabled}
        className="profile-form__file-input"
        aria-label="Выбрать файл аватара"
        aria-describedby={errorId}
        tabIndex={-1}
      />
    </Flex>
  );
}

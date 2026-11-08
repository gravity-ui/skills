import { useRef, useState } from 'react';
import { Avatar, Button, Flex, Text } from '@gravity-ui/uikit';
import { AVATAR_ACCEPT, AVATAR_MAX_BYTES, initialsOf } from './model';

interface AvatarUploaderProps {
  /** Current avatar as a data/object URL, or `null` to show initials. */
  src: string | null;
  name: string;
  /** Called with the new avatar encoded as a data URL. */
  onChange: (dataUrl: string) => void;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function AvatarUploader({ src, name, onChange }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    if (!AVATAR_ACCEPT.includes(file.type)) {
      setError('Допустимые форматы: PNG, JPEG, WebP, GIF');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setError('Размер файла не более 2 МБ');
      return;
    }

    try {
      onChange(await readAsDataUrl(file));
      setError(null);
    } catch {
      setError('Не удалось прочитать файл');
    }
  };

  return (
    <Flex alignItems="center" gap={4}>
      {src ? (
        <Avatar size="xl" shape="circle" imgUrl={src} alt={name} />
      ) : (
        <Avatar size="xl" shape="circle" theme="brand" text={initialsOf(name)} />
      )}

      <Flex direction="column" gap={1}>
        <Button view="outlined" size="m" onClick={() => inputRef.current?.click()}>
          Загрузить аватар
        </Button>
        <Text variant="caption-1" color="secondary">
          PNG, JPEG, WebP или GIF, до 2 МБ
        </Text>
        {error && (
          <Text variant="caption-1" color="danger" role="alert">
            {error}
          </Text>
        )}
      </Flex>

      <input
        ref={inputRef}
        type="file"
        accept={AVATAR_ACCEPT.join(',')}
        hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          // Allow selecting the same file again after a change.
          e.target.value = '';
        }}
      />
    </Flex>
  );
}

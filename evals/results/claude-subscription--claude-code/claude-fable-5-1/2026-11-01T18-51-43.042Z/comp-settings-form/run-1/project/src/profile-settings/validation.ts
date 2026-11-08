import type { ProfileFieldErrors, ProfileSettings } from './types';

export const NAME_MAX_LENGTH = 100;

// Намеренно нестрогая проверка: формат «что-то@домен.зона», без пробелов.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProfile(values: Pick<ProfileSettings, 'name' | 'email'>): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = 'Укажите имя';
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Не больше ${NAME_MAX_LENGTH} символов`;
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = 'Укажите email';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Некорректный адрес электронной почты';
  }

  return errors;
}

export const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024;
export const AVATAR_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
    return 'Поддерживаются только JPG, PNG и WebP';
  }
  if (file.size > AVATAR_MAX_SIZE_BYTES) {
    return 'Файл больше 2 МБ';
  }
  return null;
}

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const letters = words.slice(0, 2).map((word) => word[0]!.toUpperCase());
  return letters.join('');
}

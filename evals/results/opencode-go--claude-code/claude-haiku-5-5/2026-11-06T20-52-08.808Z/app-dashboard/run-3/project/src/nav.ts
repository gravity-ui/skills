import type { IconData } from '@gravity-ui/uikit';
import { Gear, House, Person, ShoppingCart } from '@gravity-ui/icons';

export const SECTION_IDS = ['home', 'users', 'orders', 'settings'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export interface NavSection {
  id: SectionId;
  label: string;
  icon: IconData;
}

export const SECTIONS: NavSection[] = [
  { id: 'home', label: 'Главная', icon: House },
  { id: 'users', label: 'Пользователи', icon: Person },
  { id: 'orders', label: 'Заказы', icon: ShoppingCart },
  { id: 'settings', label: 'Настройки', icon: Gear },
];

export function isSectionId(value: string): value is SectionId {
  return (SECTION_IDS as readonly string[]).includes(value);
}

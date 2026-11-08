import { Gear, House, Persons } from '@gravity-ui/icons';
import type { IconProps } from '@gravity-ui/uikit';

export interface AppRoute {
  id: string;
  path: string;
  title: string;
  icon: IconProps['data'];
}

export const ROUTES: AppRoute[] = [
  { id: 'home', path: '/', title: 'Главная', icon: House },
  { id: 'team', path: '/team', title: 'Команда', icon: Persons },
  { id: 'settings', path: '/settings', title: 'Настройки', icon: Gear },
];

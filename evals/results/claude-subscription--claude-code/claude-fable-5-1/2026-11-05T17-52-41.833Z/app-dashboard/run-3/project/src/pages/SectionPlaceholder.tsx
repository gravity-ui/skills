import { Icon, PlaceholderContainer } from '@gravity-ui/uikit';

import type { SectionConfig } from '../sidebar/Sidebar';

const DESCRIPTIONS: Record<string, string> = {
  home: 'Здесь появится сводка по магазину: выручка, новые заказы и активные пользователи.',
  users: 'Список пользователей, роли и права доступа появятся в этом разделе.',
  settings: 'Настройки магазина, уведомлений и интеграций.',
};

interface SectionPlaceholderProps {
  section: SectionConfig;
  onGoToOrders: () => void;
}

export function SectionPlaceholder({ section, onGoToOrders }: SectionPlaceholderProps) {
  return (
    <PlaceholderContainer
      size="m"
      title={section.title}
      description={DESCRIPTIONS[section.id] ?? 'Раздел в разработке.'}
      image={
        <div className="section-placeholder__image" aria-hidden="true">
          <Icon data={section.icon} size={40} />
        </div>
      }
      actions={[{ text: 'Перейти к заказам', view: 'action', onClick: onGoToOrders }]}
    />
  );
}

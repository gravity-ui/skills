import { Icon, Label, Text } from '@gravity-ui/uikit';

import type { Service, ServiceStatus } from '../data';
import { CheckIcon, WarningIcon, XmarkIcon } from '../icons';
import { WidgetFrame } from './WidgetFrame';

const STATUS: Record<ServiceStatus, { text: string; theme: 'success' | 'warning' | 'danger'; icon: () => JSX.Element }> = {
  ok: { text: 'Работает', theme: 'success', icon: CheckIcon },
  degraded: { text: 'Деградация', theme: 'warning', icon: WarningIcon },
  down: { text: 'Недоступен', theme: 'danger', icon: XmarkIcon },
};

export function ServicesWidget({ services, onRemove }: { services: Service[]; onRemove?: () => void }) {
  const problems = services.filter((s) => s.status !== 'ok').length;
  return (
    <WidgetFrame title="Сервисы" subtitle={problems ? `инцидентов: ${problems}` : 'все системы в норме'} onRemove={onRemove}>
      <ul className="services">
        {services.map((s) => {
          const status = STATUS[s.status];
          return (
            <li key={s.name} className="services__row">
              <div className="services__name">
                <Text variant="body-1" ellipsis>
                  {s.name}
                </Text>
                <Text variant="caption-2" color="secondary" className="tabular">
                  {s.latencyMs} мс · {s.uptime.toFixed(2)} %
                </Text>
              </div>
              <Label theme={status.theme} size="xs" icon={<Icon data={status.icon} size={12} />}>
                {status.text}
              </Label>
            </li>
          );
        })}
      </ul>
    </WidgetFrame>
  );
}

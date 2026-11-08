import type { ReactNode } from 'react';

interface AppIconProps {
  icon: ReactNode;
}

export function AppIcon({ icon }: AppIconProps) {
  return <span className="dashboard-icon">{icon}</span>;
}

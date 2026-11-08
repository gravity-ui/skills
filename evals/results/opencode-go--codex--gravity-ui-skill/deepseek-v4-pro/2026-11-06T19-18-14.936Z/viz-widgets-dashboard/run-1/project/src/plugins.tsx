import React from 'react';
import { Icon } from '@gravity-ui/uikit';
import { ChartColumn, Database, Bulb, BarsAscendingAlignLeft } from '@gravity-ui/icons';
import type { Plugin } from '@gravity-ui/dashkit';

type MetricSeverity = 'normal' | 'warning' | 'danger' | 'success';

interface MetricData {
  label: string;
  value: string;
  severity?: MetricSeverity;
}

function severityColor(severity?: MetricSeverity) {
  switch (severity) {
    case 'warning': return 'var(--g-color-text-warning)';
    case 'danger': return 'var(--g-color-text-danger)';
    case 'success': return 'var(--g-color-text-positive)';
    default: return 'var(--g-color-text-primary)';
  }
}

function WidgetFrame({ title, icon: IconGlyph, children }: {
  title: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--g-color-base-background)',
      border: '1px solid var(--g-color-line-generic)',
      borderRadius: 'var(--g-border-radius-l)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderBottom: '1px solid var(--g-color-line-generic)',
        background: 'var(--g-color-base-generic)',
      }}>
        <Icon data={IconGlyph} size={16} />
        <span style={{
          fontWeight: 500,
          fontSize: 'var(--g-text-body-2-font-size)',
          color: 'var(--g-color-text-primary)',
        }}>{title}</span>
      </div>
      <div style={{
        flex: 1,
        padding: '16px',
        overflow: 'auto',
        minHeight: 0,
      }}>
        {children}
      </div>
    </div>
  );
}

export const pluginMetric: Plugin = {
  type: 'metric',
  defaultLayout: { w: 8, h: 6 },
  renderer(props) {
    const data = (props.data || {}) as MetricData;
    return (
      <WidgetFrame title={data.label || 'Metric'} icon={BarsAscendingAlignLeft}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}>
          <span style={{
            fontSize: 32,
            fontWeight: 600,
            lineHeight: 1.2,
            color: severityColor(data.severity),
          }}>
            {data.value || '--'}
          </span>
          {data.label && (
            <span style={{
              marginTop: 4,
              fontSize: 'var(--g-text-body-2-font-size)',
              color: 'var(--g-color-text-secondary)',
            }}>{data.label}</span>
          )}
        </div>
      </WidgetFrame>
    );
  },
};

export const pluginChart: Plugin = {
  type: 'chart',
  defaultLayout: { w: 10, h: 8 },
  renderer(props) {
    const data = (props.data || {}) as { title?: string };
    return (
      <WidgetFrame title={data.title || 'Chart'} icon={ChartColumn}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {[75, 55, 80, 45, 70, 60, 90].map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 11,
                color: 'var(--g-color-text-hint)',
                width: 28,
                flexShrink: 0,
              }}>Mon</span>
              <div style={{
                flex: 1,
                height: 8,
                borderRadius: 'var(--g-border-radius-xs)',
                background: 'var(--g-color-base-generic)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${h}%`,
                  height: '100%',
                  borderRadius: 'var(--g-border-radius-xs)',
                  background: 'var(--g-color-base-brand)',
                }} />
              </div>
              <span style={{
                fontSize: 11,
                color: 'var(--g-color-text-secondary)',
                width: 28,
                flexShrink: 0,
                textAlign: 'right',
              }}>{h}%</span>
            </div>
          ))}
        </div>
      </WidgetFrame>
    );
  },
};

export const pluginInfo: Plugin = {
  type: 'info',
  defaultLayout: { w: 8, h: 4 },
  renderer(props) {
    const data = (props.data || {}) as { title?: string; text?: string };
    return (
      <WidgetFrame title={data.title || 'Info'} icon={Bulb}>
        <p style={{
          margin: 0,
          fontSize: 'var(--g-text-body-2-font-size)',
          color: 'var(--g-color-text-secondary)',
          lineHeight: 1.6,
        }}>
          {data.text || 'No info provided. Double-click to edit.'}
        </p>
      </WidgetFrame>
    );
  },
};

export const pluginDataTable: Plugin = {
  type: 'datatable',
  defaultLayout: { w: 12, h: 8 },
  renderer(props) {
    const data = (props.data || {}) as { title?: string; rows?: { name: string; value: string }[] };
    const rows = data.rows || [
      { name: 'Users', value: '2,847' },
      { name: 'Sessions', value: '12,430' },
      { name: 'Revenue', value: '$48,200' },
      { name: 'Bounce Rate', value: '32.5%' },
    ];
    return (
      <WidgetFrame title={data.title || 'Data'} icon={Database}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{
                textAlign: 'left',
                padding: '6px 0',
                borderBottom: '1px solid var(--g-color-line-generic)',
                fontSize: 'var(--g-text-body-2-font-size)',
                fontWeight: 500,
                color: 'var(--g-color-text-secondary)',
              }}>Name</th>
              <th style={{
                textAlign: 'right',
                padding: '6px 0',
                borderBottom: '1px solid var(--g-color-line-generic)',
                fontSize: 'var(--g-text-body-2-font-size)',
                fontWeight: 500,
                color: 'var(--g-color-text-secondary)',
              }}>Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{
                  padding: '8px 0',
                  borderBottom: '1px solid var(--g-color-line-generic)',
                  color: 'var(--g-color-text-primary)',
                  fontSize: 'var(--g-text-body-2-font-size)',
                }}>{row.name}</td>
                <td style={{
                  padding: '8px 0',
                  borderBottom: '1px solid var(--g-color-line-generic)',
                  textAlign: 'right',
                  color: 'var(--g-color-text-primary)',
                  fontSize: 'var(--g-text-body-2-font-size)',
                  fontFamily: 'var(--g-font-family-monospace)',
                }}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </WidgetFrame>
    );
  },
};

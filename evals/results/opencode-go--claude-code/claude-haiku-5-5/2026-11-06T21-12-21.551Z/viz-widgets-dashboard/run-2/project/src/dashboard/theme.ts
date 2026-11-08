// Chart tokens from the validated reference palette (light mode, categorical slots 1-3).
// Kept as JS constants so SVG attributes can use them directly.
// Slot 3 (aqua) sits below 3:1 on the surface, so every chart that uses it also has a legend
// and a table view (the "relief" rule).

export const viz = {
  surface: '#fcfcfb',
  page: '#f9f9f7',
  ink: { primary: '#0b0b0b', secondary: '#52514e', muted: '#898781' },
  grid: '#e1e0d9',
  baseline: '#c3c2b7',
  border: 'rgba(11, 11, 11, 0.1)',
  series: ['#2a78d6', '#eb6834', '#1baf7a'] as const,
  success: '#006300',
  critical: '#d03b3b',
} as const;

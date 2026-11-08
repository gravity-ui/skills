/**
 * Chart palette — the first three categorical slots of the validated default palette
 * (dataviz skill, `references/palette.md`).
 *
 * Validated with `scripts/validate_palette.js --pairs all`:
 *   light: worst pair CVD ΔE 9.2, normal-vision ΔE 24.0 — pass.
 *          Slot 3 (aqua) is 2.74:1 on the light surface → relief rule: the widget
 *          always ships the table view (see VizWidget), so the values stay reachable.
 *   dark:  worst pair CVD ΔE 9.4, normal-vision ΔE 20.9 — pass.
 *
 * The cap of three series is deliberate: past three the palette fails the all-pairs
 * floors, so the widget refuses more series instead of cycling hues.
 */
export const SERIES_LIMIT = 3;

/** Light-surface categorical slots, in fixed order: blue, orange, aqua. */
export const SERIES_COLORS_LIGHT = ['#2a78d6', '#eb6834', '#1baf7a'] as const;

/** Ink and chrome tokens for the light chart surface. Text never uses series colors. */
export const CHART_TOKENS = {
  surface: '#fcfcfb',
  textPrimary: '#0b0b0b',
  textSecondary: '#52514e',
  textMuted: '#898781',
  gridline: '#e1e0d9',
  baseline: '#c3c2b7',
} as const;

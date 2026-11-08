/** Data shapes for the custom widget plugins (stored in each dashboard item's `data`). */

// Type aliases (not interfaces) so they are assignable to DashKit's `data` index signature.

export type KpiData = {
    label: string;
    value: string;
    /** Signed change text, e.g. "+8,2%". */
    delta: string;
    /** Whether the metric went up. For every KPI here, up is good. */
    up: boolean;
};

export type LineChartData = {
    months: string[];
    /** Actual values, in thousands of rubles. */
    fact: number[];
    /** Planned values, in thousands of rubles. */
    plan: number[];
};

export type BarChartData = {
    regions: string[];
    /** Revenue per region, in millions of rubles. */
    revenue: number[];
};

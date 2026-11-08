import { lazy } from "react";
import { settings } from "@gravity-ui/chartkit";

// Keep plugin entry points behind import(): gravity-charts also re-exports its
// engine, so importing that entry point eagerly would defeat code splitting.
settings.set({
  lang: "ru",
  plugins: [
    {
      type: "gravity-charts",
      renderer: lazy(async () => {
        const { GravityChartsPlugin } =
          await import("@gravity-ui/chartkit/gravity-charts");
        return { default: GravityChartsPlugin.renderer };
      }),
    },
    {
      type: "yagr",
      renderer: lazy(async () => {
        const { YagrPlugin } = await import("@gravity-ui/chartkit/yagr");
        return { default: YagrPlugin.renderer };
      }),
    },
  ],
});

import { settings } from "@gravity-ui/chartkit";
import { GravityChartsPlugin } from "@gravity-ui/chartkit/gravity-charts";
import { YagrPlugin } from "@gravity-ui/chartkit/yagr";

// Each plugin renderer uses React.lazy internally: engines load only on use.
settings.set({ plugins: [GravityChartsPlugin, YagrPlugin], lang: "ru" });

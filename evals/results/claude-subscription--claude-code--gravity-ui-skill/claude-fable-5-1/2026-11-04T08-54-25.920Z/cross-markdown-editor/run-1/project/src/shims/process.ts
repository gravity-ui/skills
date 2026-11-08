// Браузерный шим для `process`, который @diplodoc/transform читает при загрузке модуля.
const process = {platform: 'browser', env: {} as Record<string, string | undefined>};
export default process;
export const platform = process.platform;
export const env = process.env;

let localePromise: Promise<void> | null = null;

/**
 * Подгружает русскую локаль `@gravity-ui/date-utils` (подписи дат на осях и в тултипах).
 * Делается лениво вместе с первым движком, чтобы не тянуть dayjs в основной бандл.
 * При ошибке остаёмся на английской локали — график всё равно отрисуется.
 */
export function ensureDateLocale(locale = 'ru'): Promise<void> {
    if (!localePromise) {
        localePromise = import('@gravity-ui/date-utils')
            .then(async ({settings}) => {
                await settings.loadLocale(locale);
                settings.setLocale(locale);
            })
            .catch(() => undefined);
    }
    return localePromise;
}

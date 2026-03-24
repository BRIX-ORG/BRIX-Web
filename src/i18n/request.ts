import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
    // Provide a static locale or read it from a cookie/header if needed for server components.
    // Since we use non-routing mode with Zustand, we can default to 'en'.
    const locale = 'en';

    return {
        locale,
        timeZone: 'UTC',
        messages: (await import(`../../locales/${locale}.json`)).default,
    };
});

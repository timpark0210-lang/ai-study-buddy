import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
    // Await the requestLocale as per Next.js 16 / next-intl v4 requirements
    const locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    // Generic normalization for regional variants (e.g., en-NZ, en-US)
    let messageLocale = locale;
    if (typeof locale === 'string' && locale.startsWith('en')) messageLocale = 'en';
    if (typeof locale === 'string' && locale.startsWith('ko')) messageLocale = 'ko';

    // If still not found in supported locales, fallback to default
    if (!routing.locales.includes(messageLocale as any)) {
        messageLocale = routing.defaultLocale;
    }

    return {
        locale: messageLocale as string,
        messages: (await import(`@/messages/${messageLocale}.json`)).default
    };
});

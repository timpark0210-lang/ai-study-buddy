import { Montserrat } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '@/app/globals.css';

const montserrat = Montserrat({ subsets: ['latin'] });

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering in next-intl v4 / Next.js 16
  setRequestLocale(locale);

  // Safely load messages
  const messages = await getMessages();

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={`${montserrat.className} bg-slate-950 text-slate-50 min-h-screen overflow-x-hidden`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <div className="relative isolate min-h-screen">
            <div className="fixed inset-0 -z-10 bg-slate-950">
              <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
              </div>
            </div>
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

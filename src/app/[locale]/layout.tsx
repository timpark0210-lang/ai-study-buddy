import { Spline_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Sidebar from '@/components/layout/Sidebar';
import '@/app/globals.css';

const spline = Spline_Sans({ subsets: ['latin'], variable: '--font-spline' });

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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className={`${spline.variable} font-sans bg-[#0b1326] text-slate-50 min-h-screen overflow-x-hidden selection:bg-indigo-500/30`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <div className="relative isolate min-h-screen">
            <div className="fixed inset-0 -z-10 bg-slate-950">
              <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
              </div>
            </div>
            <Sidebar />
            <main className="pl-64 min-h-screen">
              {children}
            </main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

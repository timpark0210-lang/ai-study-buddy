'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLanguage = () => {
        const nextLocale = locale === 'en' ? 'ko' : 'en';
        const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
        router.push(newPath || `/${nextLocale}`);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/40 transition-all text-sm font-medium"
            title={locale === 'en' ? 'Switch to Korean' : 'Switch to English'}
        >
            <Languages size={18} className="text-primary" />
            <span>{locale.toUpperCase()}</span>
        </button>
    );
}

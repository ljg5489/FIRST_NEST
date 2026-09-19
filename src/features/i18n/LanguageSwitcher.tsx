// 파일 위치: src/features/i18n/LanguageSwitcher.tsx
// 파일 명: LanguageSwitcher.tsx

"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent, useEffect, useTransition } from "react";
import { TravelIcon } from "@/app/(web)/components/TravelIcon";
import {
  LOCALE_COOKIE_NAME,
  localeOptions,
  navigationMessages,
  type Locale,
} from "./config";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const messages = navigationMessages[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function changeLanguage(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as Locale;
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    document.documentElement.lang = nextLocale;
    startTransition(() => router.refresh());
  }

  return (
    <label className="language-switcher" title={messages.languageLabel}>
      <TravelIcon name="globe" size={17} />
      <span className="sr-only">{messages.languageLabel}</span>
      <select
        aria-label={messages.languageLabel}
        value={locale}
        onChange={changeLanguage}
        disabled={isPending}
      >
        {localeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

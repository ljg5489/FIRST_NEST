// 파일 위치: src/features/i18n/I18nProvider.tsx
// 파일 명: I18nProvider.tsx

"use client";

import {createContext, useCallback, useContext, type ReactNode} from "react";
import type {Locale} from "./config";
import {localeTag, translate, translateValue} from "./messages";

const LocaleContext = createContext<Locale>("ko");

export function I18nProvider({locale, children}:{locale:Locale; children:ReactNode}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const locale = useContext(LocaleContext);
  const t = useCallback((source:string) => translate(locale, source), [locale]);
  const value = useCallback((source:string) => translateValue(locale, source), [locale]);
  return {
    locale,
    localeTag: localeTag(locale),
    t,
    value,
  };
}

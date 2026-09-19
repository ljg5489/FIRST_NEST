// 파일 위치: src/app/(web)/components/SiteFooter.tsx
// 파일 명: SiteFooter.tsx

import {navigationMessages,type Locale} from '@/features/i18n/config';

export function SiteFooter({locale}:{locale:Locale}){const messages=navigationMessages[locale];return <footer className="travel-footer"><div className="page-shell"><div className="footer-top"><div><a href="/" className="brand-name">travel with me<span>.</span></a><p>{messages.footerTagline}</p></div><div className="footer-links"><a href="/explore">{messages.explore}</a><a href="/recommend">{messages.recommend}</a><a href="/account">{messages.myTrip}</a></div></div><div className="footer-bottom"><p>{messages.footerDescription}<br/>{messages.footerNotice}</p><div><a href="/terms">{messages.terms}</a><a href="/privacy">{messages.privacy}</a><span>© travel with me</span></div></div></div></footer>}
